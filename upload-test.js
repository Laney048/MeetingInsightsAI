// Script to test file upload
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { FormData } = require('formdata-node');

async function uploadFile() {
  try {
    // Path to the CSV file
    const filePath = path.join(__dirname, 'attached_assets', 'week 2 - Problem_2_-_Meeting_Usefulness_Tracker.csv');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('CSV file not found at:', filePath);
      return;
    }
    
    console.log('Found CSV file at:', filePath);
    
    // Create a FormData instance
    const form = new FormData();
    
    // Add the file to the form
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const fileBlob = new Blob([fileContents], { type: 'text/csv' });
    form.append('file', fileBlob, 'meeting-data.csv');
    form.append('clearExisting', 'true');
    
    // Make the request
    const req = http.request({
      host: 'localhost',
      port: 5000,
      path: '/api/meetings/upload',
      method: 'POST',
      headers: {
        ...form.headers,
      },
    });
    
    // Send the form data
    req.on('response', (res) => {
      console.log('Response status code:', res.statusCode);
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Response data:', data);
      });
    });
    
    req.on('error', (error) => {
      console.error('Error uploading file:', error);
    });
    
    // Write the form data to the request
    req.write(form);
    req.end();
    
  } catch (error) {
    console.error('Error in upload process:', error);
  }
}

uploadFile();