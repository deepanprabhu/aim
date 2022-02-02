import React from 'react';

import { Grid, TextField } from '@material-ui/core';

import { Modal, Slider, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';

import { previewBounds } from './config';
import { IExportPreviewProps } from './ExportPreview.d';

import './ExportPreview.scss';

function ExportPreview({
  openModal,
  onToggleExportPreview,
  withDynamicDimensions,
  children,
}: IExportPreviewProps): React.FunctionComponentElement<React.ReactNode> {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [previewDimensions, setPreviewDimensions] = React.useState({
    width: 1024,
    height: 640,
  });
  const [imageExport, setImageToExport] = React.useState<null | SVGSVGElement>(
    null,
  );

  function onDownload(): void {}

  function onDimensionChange(key: string, newValue: number): void {
    setPreviewDimensions((prev) => ({
      ...prev,
      [key]: +newValue,
    }));
  }

  function clearImage(svgElement: SVGSVGElement) {
    const attributes = svgElement.querySelector('.Attributes');
    // remove hover attributes from chart
    if (attributes) {
      attributes.remove?.();
    }
    return svgElement;
  }

  function loadImg() {
    const panel = containerRef.current;
    debugger;
    if (panel) {
      // setProcessing(true);
      const svgElements = panel.querySelectorAll('svg');
      const wrapper = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );

      const firstSvg = svgElements[0];
      debugger;
      const bbox = firstSvg.getBBox();
      const svgWidth = Math.round(bbox.width);
      const svgHeight = Math.round(bbox.height);
      const gridSize = Math.round(panel.scrollWidth / svgWidth);
      let row = 0;

      console.log(gridSize);
      svgElements?.forEach((svgElement, index) => {
        if (index !== 0 && index % gridSize === 0) {
          row++;
        }
        const clearedSvgElement = clearImage(
          svgElement.cloneNode(true) as SVGSVGElement,
        );
        debugger;
        clearedSvgElement.style.border = '1px solid #e8e8e8';
        clearedSvgElement.style.background = 'transparent';
        clearedSvgElement.setAttribute(
          'x',
          (index % gridSize) * svgWidth + 10 + 'px',
        );
        if (row) {
          clearedSvgElement.setAttribute('y', row * svgHeight + 10 + 'px');
        }
        wrapper.appendChild(clearedSvgElement);
      });
      const root = document.getElementById('root');
      wrapper.style.position = 'fixed';
      wrapper.style.zIndex = '10';
      wrapper.style.background = 'transparent';
      wrapper.style.width = `${panel.scrollWidth}px`;
      wrapper.style.height = `${panel.scrollHeight}px`;
      wrapper.style.top = '10px';
      wrapper.style.left = '10px';
      root?.appendChild(wrapper);
      setImageToExport(wrapper);

      // window.clearTimeout(timeOutId.current);
      // timeOutId.current = window.setTimeout(setImg);
      window.setTimeout(() => setImg(wrapper));
    }
  }

  function downloadLink(href: string, name: string) {
    let link = document.createElement('a');
    link.download = name;
    link.style.opacity = '0';
    document.body.append(link);
    link.href = href;
    link.click();
    link.remove();
  }

  async function setImg(captureNode: SVGSVGElement) {
    try {
      debugger;
      // const canvas = await html2canvas(captureNode, {
      //   removeContainer: true,
      //   width: captureNode.offsetWidth,
      //   height: captureNode.offsetHeight,
      //   backgroundColor: null,
      // });
      // console.log(captureNode.childNodes);
      const serializer = new XMLSerializer();
      const serializedString = serializer.serializeToString(captureNode);
      const imgSrc =
        'data:image/svg+xml;base64,' +
        btoa(unescape(encodeURIComponent(serializedString)));
      // svgString2Image(
      //   serializedString,
      //   captureNode.scrollWidth,
      //   captureNode.scrollHeight,
      //   'image/jpeg',
      //   (dataURL: string) => {
      //     downloadLink(dataURL, 'svg');
      //   },
      // );

      debugger;

      // const imgBase64Src = canvas.toDataURL('image/png', 1.0);
      console.log(imgSrc);

      // downloadLink(imgSrc, '123123123');
      // setExportImgCanvas(canvas);
    } catch (err) {
      console.error(err);
    } finally {
      // setProcessing(false);
    }
  }

  return (
    <ErrorBoundary>
      <Modal
        open={openModal}
        className='ExportPreview'
        title='Chart Exporting Preview'
        withoutTitleIcon
        maxWidth={false}
        okButtonText='Download'
        onClose={onToggleExportPreview}
        onOk={onDownload}
        classes={{ paper: 'ExportPreview__modal' }}
      >
        {withDynamicDimensions && (
          <div className='ExportPreview__dimension'>
            <div className='ExportPreview__dimension__width'>
              <Text>Width</Text>
              <Slider
                aria-label='Width'
                valueLabelDisplay='auto'
                containerClassName='ExportPreview__dimension__width__slider'
                min={previewBounds.min.width}
                max={previewBounds.max.width}
                step={2}
                value={previewDimensions.width}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  onDimensionChange('width', v as number);
                }}
              />
              <TextField
                id='Width'
                aria-label='Width'
                type='number'
                size='small'
                className='ExportPreview__dimension__width__input'
                inputProps={{
                  min: previewBounds.min.width,
                  max: previewBounds.max.width,
                  step: 2,
                }}
                value={previewDimensions.width}
                onChange={(
                  event: React.ChangeEvent<
                    HTMLTextAreaElement | HTMLInputElement
                  >,
                ) => {
                  onDimensionChange('width', +event.target.value);
                }}
              />
            </div>
            <div className='ExportPreview__dimension__height'>
              <Text className='ExportPreview__dimension__height__label'>
                Height
              </Text>
              <Slider
                aria-label='Height'
                valueLabelDisplay='auto'
                containerClassName='ExportPreview__dimension__height__slider'
                min={previewBounds.min.height}
                max={previewBounds.max.height}
                step={2}
                value={previewDimensions.height}
                onChange={(e: React.ChangeEvent<{}>, v: number | number[]) => {
                  onDimensionChange('height', v as number);
                }}
              />
              <TextField
                id='Height'
                aria-label='Height'
                type='number'
                size='small'
                className='ExportPreview__dimension__height__input'
                inputProps={{
                  min: previewBounds.min.height,
                  max: previewBounds.max.height,
                  step: 2,
                }}
                value={previewDimensions.height}
                onChange={(
                  event: React.ChangeEvent<
                    HTMLTextAreaElement | HTMLInputElement
                  >,
                ) => {
                  onDimensionChange('height', +event.target.value);
                }}
              />
            </div>
          </div>
        )}
        <div className='ExportPreview__container'>
          <div style={{ ...previewDimensions }}>
            <Grid
              ref={containerRef}
              key={`${previewDimensions.width}-${previewDimensions.height}`}
              container
              className='ExportPreview__container__grid'
            >
              {children}
            </Grid>
          </div>
        </div>
      </Modal>
    </ErrorBoundary>
  );
}

ExportPreview.displayName = 'ExportPreview';

export default React.memo<IExportPreviewProps>(ExportPreview);
