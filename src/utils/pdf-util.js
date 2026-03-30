import * as pdfjs from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Extracts text and optionally the first image from a PDF file.
 * @param {File|string} source - The PDF file object or a URL to the PDF.
 * @returns {Promise<{text: string, photo: string|null}>} - The extracted text and photo data URL.
 */
export const extractDataFromPDF = async (source) => {
  return new Promise((resolve, reject) => {
    const handleArrayBuffer = async (arrayBuffer) => {
      try {
        const typedarray = new Uint8Array(arrayBuffer);
        const pdf = await pdfjs.getDocument(typedarray).promise;
        let fullText = '';
        let firstImage = null;
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          
          // Extract text
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';

          // Extract first image only if not found yet (wrapped in try-catch to prevent crash)
          if (!firstImage) {
            try {
              const ops = await page.getOperatorList();
              for (let j = 0; j < ops.fnArray.length; j++) {
                if (ops.fnArray[j] === pdfjs.OPS.paintJpegXObject || ops.fnArray[j] === pdfjs.OPS.paintImageXObject) {
                  const name = ops.argsArray[j][0];
                  let commonObj;
                  try {
                    commonObj = await page.commonObjs.get(name) || await page.objs.get(name);
                  } catch (e) { continue; }
                  
                  if (commonObj && commonObj.data && commonObj.width && commonObj.height) {
                      const canvas = document.createElement('canvas');
                      canvas.width = commonObj.width;
                      canvas.height = commonObj.height;
                      const ctx = canvas.getContext('2d');
                      
                      // Check if data is correct length for RGBA
                      if (commonObj.data.length === commonObj.width * commonObj.height * 4) {
                        const imgData = ctx.createImageData(commonObj.width, commonObj.height);
                        imgData.data.set(commonObj.data);
                        ctx.putImageData(imgData, 0, 0);
                        firstImage = canvas.toDataURL('image/jpeg');
                        break;
                      }
                  }
                }
              }
            } catch (imageError) {
              console.warn('Failed to extract image from PDF, skipping:', imageError);
            }
          }
        }
        
        if (!fullText.trim()) {
            throw new Error('No text content found in PDF.');
        }

        resolve({ text: fullText.trim(), photo: firstImage });
      } catch (error) {
        console.error('Detailed PDF parsing error:', error);
        reject(error);
      }
    };

    if (typeof source === 'string') {
      fetch(source)
        .then(response => response.arrayBuffer())
        .then(handleArrayBuffer)
        .catch(reject);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => handleArrayBuffer(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(source);
    }
  });
};

// Deprecated: kept for backward compatibility if needed, but should use extractDataFromPDF
export const extractTextFromPDF = async (source) => {
    const result = await extractDataFromPDF(source);
    return result.text;
};
