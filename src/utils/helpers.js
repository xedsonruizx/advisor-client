export function getProcessedMediaUrl(url) {
  if (!url) return ''
  
  // Handle Google Drive URLs
  if (url.includes('drive.google.com')) {
    // Try to extract file ID from common Drive URL patterns
    const idMatch = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/)
    if (idMatch && idMatch[1]) {
      // Use the export=view format which works for direct image embedding
      return `https://drive.google.com/uc?export=view&id=${idMatch[1]}`
    }
  }
  
  return url
}
