from aim.sdk.num_utils import inst_has_typename
from aim.storage.object import CustomObject
from aim.storage.types import BLOB


@CustomObject.alias('aim.figure')
class Figure(CustomObject):
    """
    Figure object can be used for storing Plotly or Matplotlib figures into Aim repository.
    Core functionality is based on Plotly.

    Args:
         obj (:obj:): plotly or matplotlib figure object.
    """

    AIM_NAME = 'aim.figure'

    def __init__(self, obj):
        super().__init__()

        if inst_has_typename(obj, ['matplotlib', 'Figure']):
            self._from_matplotlib_figure(obj)
        elif inst_has_typename(obj, ['plotly', 'Figure', 'BaseFigure']):
            self._prepare(obj)
        else:
            raise TypeError('Object is not a Plotly Figure instance')

    def _prepare(self, obj):
        try:
            from plotly.version import __version__ as plotly_version
        except ModuleNotFoundError:
            plotly_version = 'unknown'

        assert hasattr(obj, 'to_json')

        self.storage['source'] = 'plotly'
        self.storage['version'] = plotly_version
        self.storage['format'] = 'raw_json'
        self.storage['data'] = BLOB(data=obj.to_json())

    def _from_matplotlib_figure(self, obj):
        try:
            from plotly.tools import mpl_to_plotly
        except ModuleNotFoundError:
            raise ModuleNotFoundError('Plotly is required to track matplotlib figure.')

        try:
            plotly_obj = mpl_to_plotly(obj)
        except ValueError as err:
            raise ValueError(f'Failed to convert matplotlib figure to plotly figure: {err}')

        return self._prepare(plotly_obj)

    def json(self):
        blob_data = self.storage['data']
        return blob_data.data

    def to_plotly_figure(self):
        try:
            from plotly.io import from_json
        except ModuleNotFoundError:
            raise ModuleNotFoundError('Could not find plotly in the installed modules.')

        return from_json(self.json())
