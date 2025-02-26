import React, { useState, useEffect } from 'react';
import { Upload, FileText, X } from 'lucide-react';
import { jsPDF } from 'jspdf';

const ImageToPdfConverter = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [convertingStatus, setConvertingStatus] = useState('idle'); // 'idle', 'converting', 'done'
  
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    // Filter for image files only
    const imageFiles = files.filter(file => 
      file.type.match('image.*')
    );
    
    if (imageFiles.length === 0) return;
    
    // Create preview URLs for the images
    const newFiles = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));
    
    setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
  };
  
  const removeFile = (index) => {
    setSelectedFiles(prevFiles => {
      const updatedFiles = [...prevFiles];
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(updatedFiles[index].preview);
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
  };
  
  const convertToPdf = async () => {
    if (selectedFiles.length === 0) return;
    
    setConvertingStatus('converting');
    
    try {
      const pdf = new jsPDF();
      
      // Add each image to the PDF
      for (let i = 0; i < selectedFiles.length; i++) {
        if (i > 0) pdf.addPage();
        
        // Create an image element to get dimensions
        const img = new Image();
        img.src = selectedFiles[i].preview;
        
        await new Promise(resolve => {
          img.onload = resolve;
        });
        
        // Calculate dimensions to fit page
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgRatio = img.width / img.height;
        
        let imgWidth = pageWidth - 20; // Margins
        let imgHeight = imgWidth / imgRatio;
        
        if (imgHeight > pageHeight - 20) {
          imgHeight = pageHeight - 20;
          imgWidth = imgHeight * imgRatio;
        }
        
        pdf.addImage(
          img, 
          'JPEG', 
          (pageWidth - imgWidth) / 2, 
          (pageHeight - imgHeight) / 2, 
          imgWidth, 
          imgHeight
        );
      }
      
      pdf.save('converted-images.pdf');
      setConvertingStatus('done');
      
      setTimeout(() => {
        setConvertingStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Error converting to PDF:', error);
      setConvertingStatus('idle');
    }
  };
  
  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        URL.revokeObjectURL(file.preview);
      });
    };
  }, []);
  
  return (
    <div className="converter-container">
      <div className="converter-header">
        <div className="converter-title">
          <FileText className="icon" />
          Image to PDF Converter
        </div>
        <div className="converter-description">
          Upload your images and convert them into a single PDF document
        </div>
      </div>
      
      <div className="converter-content">
        {selectedFiles.length === 0 ? (
          <div className="upload-area">
            <div className="upload-icon">
              <Upload size={48} />
            </div>
            <p className="upload-text">Drag and drop image files here, or click to browse</p>
            <label
              htmlFor="file-upload"
              className="browse-button"
            >
              Browse Files
            </label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden-input"
            />
          </div>
        ) : (
          <div>
            <div className="selected-header">
              <h3>Selected Images ({selectedFiles.length})</h3>
              <label
                htmlFor="add-more-files"
                className="add-more-button"
              >
                Add More
              </label>
              <input
                id="add-more-files"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden-input"
              />
            </div>
            
            <div className="image-grid">
              {selectedFiles.map((file, index) => (
                <div key={index} className="image-item">
                  <div className="image-preview">
                    <img
                      src={file.preview}
                      alt={file.name}
                    />
                  </div>
                  <div className="image-name">{file.name}</div>
                  <button
                    onClick={() => removeFile(index)}
                    className="remove-button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="converter-footer">
        <button
          onClick={convertToPdf}
          disabled={selectedFiles.length === 0 || convertingStatus !== 'idle'}
          className={`convert-button ${selectedFiles.length === 0 || convertingStatus !== 'idle' ? 'disabled' : ''}`}
        >
          {convertingStatus === 'idle' && (
            <>
              <FileText className="button-icon" size={18} />
              Convert to PDF
            </>
          )}
          {convertingStatus === 'converting' && 'Converting...'}
          {convertingStatus === 'done' && 'Download Ready!'}
        </button>
      </div>
    </div>
  );
};

export default ImageToPdfConverter;