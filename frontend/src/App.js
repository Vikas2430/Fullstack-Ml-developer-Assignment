import React, { useState } from 'react';

function PdfDataExtractor() {
    const [pdfFile, setPdfFile] = useState(null);
    const [extractedData, setExtractedData] = useState({
        name: 'Not Found',
        phone: 'Not Found', 
        address: 'Not Found'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setError('');
        } else {
            setError('Please select a valid PDF file');
            setPdfFile(null);
        }
    };

    const handleExtractData = async () => {
        if (!pdfFile) {
            setError('Please select a PDF file first');
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('pdf', pdfFile);

        try {
            const response = await fetch('http://localhost:5000/extract', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw 'Failed to extract data from PDF';
            }
            const extractedInfo = await response.json();
            setExtractedData(extractedInfo);
        } catch (err) {
            setError(typeof err === 'string' ? err : 'Error extracting data: ' + err.message);
            setExtractedData({
                name: 'Not Found',
                phone: 'Not Found', 
                address: 'Not Found'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            maxWidth: '500px', 
            margin: '0 auto', 
            padding: '20px', 
            fontFamily: 'Arial, sans-serif' 
        }}>
            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
                PDF Data Extractor
            </h1>
            
            <div style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                padding: '20px', 
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
            }}>
                <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    disabled={loading}
                    style={{ 
                        width: '100%', 
                        marginBottom: '10px', 
                        padding: '10px' 
                    }}
                />
                <button 
                    onClick={handleExtractData} 
                    disabled={loading || !pdfFile}
                    style={{ 
                        width: '100%', 
                        padding: '10px', 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: pdfFile && !loading ? 'pointer' : 'not-allowed',
                        opacity: pdfFile && !loading ? 1 : 0.5
                    }}
                >
                    {loading ? 'Extracting...' : 'Extract Data'}
                </button>

                {error && (
                    <div style={{ 
                        color: 'red', 
                        backgroundColor: '#ffeeee', 
                        border: '1px solid red', 
                        padding: '10px', 
                        marginTop: '10px', 
                        borderRadius: '4px' 
                    }}>
                        {error}
                    </div>
                )}

                <div style={{ marginTop: '20px' }}>
                    <h2 style={{ 
                        borderBottom: '1px solid #ddd', 
                        paddingBottom: '10px' 
                    }}>
                        Extracted Data:
                    </h2>
                    <p><strong>Name:</strong> {extractedData.name}</p>
                    <p><strong>Phone:</strong> {extractedData.phone}</p>
                    <p><strong>Address:</strong> {extractedData.address}</p>
                </div>
            </div>
        </div>
    );
}

export default PdfDataExtractor;