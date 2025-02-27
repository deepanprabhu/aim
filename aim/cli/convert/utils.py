import json
import os

import click

from aim import Image, Run


def parse_tf_events(tf_logs, repo_inst, flat=False):
    """
    This function scans and collects records from TF event files.

    Creates and uses cache file "tf_logs_cache" in the repo dir
    to track previously processed files and values

    For more info please refer to this guide: docs/source/guides/integrations/basic_aim_tensorflow_event_conversion.md
    """

    try:
        # This import statement takes long to complete
        import tensorflow as tf
        from tensorflow.python.summary.summary_iterator import summary_iterator
    except ModuleNotFoundError:
        click.echo(
            click.style(
                'Could not process TF events - failed to import tensorflow module.', fg='red'
            )
        )
        return

    supported_plugins = ('images', 'scalars')
    unsupported_plugin_noticed = False
    tf_logs_cache_path = os.path.join(repo_inst.path, 'tf_logs_cache')

    try:
        with open(tf_logs_cache_path) as FS:
            tf_logs_cache = json.load(FS)
    except Exception:
        tf_logs_cache = {}

    def get_parent(current_path, level=0):
        # level 0 is the direct parent directory
        if level <= 0:
            return os.path.dirname(current_path)
        elif current_path in ('', '.', '/'):
            return current_path
        return get_parent(os.path.dirname(current_path), level - 1)

    tf_logs = os.path.abspath(tf_logs)
    run_dir_candidates = set()
    for root, dirs, files in os.walk(tf_logs):
        for file in files:
            if not file.startswith('events.out.tfevents'):
                continue

            file_path = os.path.abspath(os.path.join(root, file))
            run_dir = get_parent(file_path)

            if not run_dir.startswith(tf_logs):
                # it's outside tf_logs
                continue

            run_dir_candidates.add(run_dir)

    def get_level(current_path):
        level = -1
        while current_path.startswith(tf_logs):
            current_path, _ = os.path.split(current_path)
            level += 1
        return level

    run_dir_candidates = sorted(run_dir_candidates, key=get_level, reverse=True)
    run_dir_candidates_filtered = set()
    run_dir_ignored = set()
    groups = set()

    for run_dir in run_dir_candidates:
        if run_dir in run_dir_candidates_filtered:
            # already tagged as a run dir
            continue

        if run_dir in groups:
            # run dir which has other run dirs inside, so we skip it
            run_dir_ignored.add(run_dir)
            continue

        depth = get_level(run_dir)
        if depth >= 2:
            if flat:
                run_group_dir = get_parent(run_dir, 0)
                new_run_dir = run_dir
            else:
                run_group_dir = get_parent(run_dir, 1)
                new_run_dir = get_parent(run_dir, 0)
                if new_run_dir in groups:
                    new_run_dir = run_dir
            groups.add(run_group_dir)
        elif depth == 1:
            new_run_dir = run_dir
        else:
            continue
        run_dir_candidates_filtered.add(new_run_dir)

    if run_dir_ignored:
        click.echo('WARN: Found directory entries with unorganized even files!\n'
                   'Please read the preparation instructions to properly process these files.\n'
                   'Event files in the following directories will be ignored:', err=True)
        for c, r in enumerate(run_dir_ignored, start=1):
            click.echo(f'{c}: {r}', err=True)

    for path in run_dir_candidates_filtered:
        click.echo(f'Converting TensorFlow events in {path}')

        events = {}
        for root, dirs, files in os.walk(path):
            for file in files:
                if 'events.out.tfevents' not in file:
                    continue
                file_path = os.path.join(root, file)
                if file_path == os.path.join(path, file):
                    entry = None
                else:
                    entry = os.path.basename(os.path.dirname(file_path))
                events[file_path] = {
                    'context': {
                        'entry': entry
                    }
                }

        if path not in tf_logs_cache:
            tf_logs_cache[path] = {}

        run_cache = tf_logs_cache[path]
        if run_cache:
            run = Run(
                repo=repo_inst,
                system_tracking_interval=None,
                run_hash=run_cache['run_hash'],
            )
        else:
            run = Run(
                repo=repo_inst,
                system_tracking_interval=None,
            )
            run['tf_logdir'] = path
            run_cache.update({
                'run_hash': run.hash,
                'events': {},
            })
        run_tf_events = run_cache['events']

        events_to_process = []
        for event in events:
            last_modified_at = os.path.getmtime(event)
            try:
                assert last_modified_at == run_tf_events[event]['last_modified_at']
            except (KeyError, AssertionError):
                # Something has changed or hasn't been processed before
                events_to_process.append(event)
                try:
                    run_tf_events[event]['last_modified_at'] = last_modified_at
                except KeyError:
                    # Completely new event
                    run_tf_events[event] = {
                        'last_modified_at': last_modified_at,
                        'values': {},
                    }

        for count, event_file in enumerate(events_to_process, start=1):
            click.echo(f'({count}/{len(events_to_process)}) Parsing TF event: {os.path.basename(event_file)}')
            run_tf_event = run_tf_events[event_file]
            event_context = events[event_file]['context']
            for event in summary_iterator(event_file):
                timestamp = event.wall_time
                step = event.step
                for value in event.summary.value:
                    tag = value.tag
                    plugin_name = value.metadata.plugin_data.plugin_name
                    value_id = f'{tag}_{plugin_name}'
                    if value_id in run_tf_event['values']:
                        if run_tf_event['values'][value_id]['timestamp'] >= timestamp:
                            # prevent previously tracked data from re-tracking upon file update
                            continue

                    if plugin_name not in supported_plugins:
                        if not unsupported_plugin_noticed:
                            click.echo(
                                'Found unsupported plugin type in the TF events. '
                                'Data for these wont be processed. '
                                'Supported plugin types are: {}'.format(', '.join(supported_plugins)),
                                err=True
                            )
                            unsupported_plugin_noticed = True
                        continue

                    if plugin_name == 'images':
                        tf_tensors = value.tensor.string_val[2:]
                        track_val = [
                            Image(tf.image.decode_image(tf_tensor).numpy()) for tf_tensor in tf_tensors
                        ]
                        if len(track_val) == 1:
                            track_val = track_val[0]
                    else:
                        d_type = tf.dtypes.DType(value.tensor.dtype)
                        decoded = tf.io.decode_raw(value.tensor.tensor_content, d_type)
                        track_val = float(decoded)

                    run_tf_event['values'][value_id] = {
                        'step': step,
                        'timestamp': timestamp
                    }
                    run._track_impl(track_val, timestamp, tag, step, context=event_context)

    # refresh cache
    with open(tf_logs_cache_path, 'w') as FS:
        json.dump(tf_logs_cache, FS)

    click.echo('TF logs conversion complete!')
