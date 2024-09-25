import domtoimage, { type Options } from 'dom-to-image'

const defaultOptions: Options = {
  width: 400,
  height: 400
}

const getFormattedOptions = (element: HTMLElement, options: Options): Options => {
  if (options.width && options.height) {
    const scale = getResizeScaleToFit(element, options.width, options.height)
    return {
      style: { scale, transformOrigin: 'left top', borderRadius: '48px' },
      quality: 100,
      ...options
    }
  }

  return defaultOptions
}

const getResizeScaleToFit = (child: HTMLElement, width: number, height: number): number => {
  child.style.transformOrigin = 'center'

  const scaleX = width / child.offsetWidth
  const scaleY = height / child.offsetHeight

  const maxScale = Math.min(scaleX, scaleY)
  return maxScale
}

export const IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED =
  navigator.clipboard && navigator.clipboard.write != undefined

export async function copyImageToClipboard(element: HTMLElement, options: Options) {
  if (IS_COPY_IMAGE_TO_CLIPBOARD_SUPPORTED) {
    const formattedOptions = getFormattedOptions(element, options)
    console.debug('Converting to blob')
    domtoimage.toBlob(element, formattedOptions).then((blob: Blob) => {
      const item = new ClipboardItem({ [blob.type]: blob })
      navigator.clipboard.write([item]).then(
        () => {
          console.log('Blob copied to clipboard')
        },
        (error) => {
          console.error('Error copying blob to clipboard:', error)
        }
      )
    })
  }
}

export function getPngElement(element: HTMLElement, options: Options) {
  const formattedOptions = getFormattedOptions(element, options)
  return domtoimage.toPng(element, formattedOptions)
}

export function downloadPngElement(element: HTMLElement, filename: string, options: Options) {
  var reader = new FileReader();
  reader.onload = function(event) {
   var win = window.open(event.target.result,"_blank");
   win.onload = function() { win.print(); }
  };
  domtoimage.toBlob(element).then(function (blob0) {reader.readAsDataURL(blob0); });
  /*getPngElement(element, options).then((dataUrl: string) => {
    //const link = document.createElement('a')
    //link.href = dataUrl
    //link.download = filename
    //link.click()
  }).catch((error: Error) => {
    console.error('Error converting element to PNG:', error)
  })*/
}

export function getSvgElement(element: HTMLElement, options: Options) {
  const formattedOptions = getFormattedOptions(element, options)
  return domtoimage.toSvg(element, formattedOptions)
}

export function downloadSvgElement(element: HTMLElement, filename: string, options: Options) {
  getSvgElement(element, options).then((dataUrl: string) => {
    const link = document.createElement('a')
    link.href = dataUrl
    link.download = filename
    link.click()
  }).catch((error: Error) => {
    console.error('Error converting element to SVG:', error)
  })
}
