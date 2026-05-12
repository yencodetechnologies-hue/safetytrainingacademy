import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Cloudinary PDF worker setup
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

const PdfViewer = ({ fileUrl }) => {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [loading, setLoading] = useState(true);

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
        setLoading(false);
    }

    return (
        <div className="pdf-viewer-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                    disabled={pageNumber <= 1} 
                    onClick={() => setPageNumber(prev => prev - 1)}
                    style={{ padding: '5px 15px', borderRadius: '5px', border: '1px solid #ccc', background: 'white', cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer' }}
                >
                    Previous
                </button>
                <span style={{ fontWeight: '600' }}>Page {pageNumber} of {numPages}</span>
                <button 
                    disabled={pageNumber >= numPages} 
                    onClick={() => setPageNumber(prev => prev + 1)}
                    style={{ padding: '5px 15px', borderRadius: '5px', border: '1px solid #ccc', background: 'white', cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer' }}
                >
                    Next
                </button>
            </div>

            <div style={{ maxWidth: '100%', overflowX: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'white' }}>
                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={<div style={{ padding: '20px' }}>Loading PDF...</div>}
                >
                    <Page pageNumber={pageNumber} width={window.innerWidth > 768 ? 600 : window.innerWidth - 60} />
                </Document>
            </div>
        </div>
    );
};

export default PdfViewer;
