import fs from 'fs';
import yaml from 'js-yaml';
import QRCode from 'qrcode';
import path from 'path';
import { execSync } from 'child_process';

const dataPath = path.join(process.cwd(), 'public/data/cv-data.yaml');
const publicDir = path.join(process.cwd(), 'public');
const imagesDir = path.join(publicDir, 'images');
const qrPath = path.join(imagesDir, 'qr-code.png');
const metaPath = path.join(process.cwd(), 'src/cv-meta.ts');

// Ensure directories exist
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

try {
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const data: any = yaml.load(fileContents);
  
  // 1. Generate QR Code
  if (data.basics && data.basics.latestVersionUrl) {
    QRCode.toFile(qrPath, data.basics.latestVersionUrl, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#00000000'
      }
    }, (err) => {
      if (err) throw err;
      console.log('QR code generated successfully at ' + qrPath);
      
      // 2. Generate PDF
      generatePdf(data);
    });
  } else {
    console.log('No latestVersionUrl found in cv-data.yaml');
    generatePdf(data);
  }

} catch (e) {
  console.error(e);
  process.exit(1);
}

function generatePdf(data: any) {
    const name = data.basics?.name || 'CV';
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const filename = `${name} - CV - ${dateStr}.pdf`;
    
    const template = data.basics.template || 'default';
    const inputPath = path.join(process.cwd(), `src/templates/${template}/pdf/cv.typ`);
    const outputPath = path.join(publicDir, filename);
    
    console.log(`Generating PDF: ${filename} using template ${template}...`);
    
    try {
        // Clean up old PDFs
        if (fs.existsSync(publicDir)) {
            const files = fs.readdirSync(publicDir);
            for (const file of files) {
                if (file.endsWith('.pdf') && file !== filename) {
                    fs.unlinkSync(path.join(publicDir, file));
                }
            }
        }

        execSync(`typst compile --root . "${inputPath}" "${outputPath}"`, { stdio: 'inherit' });
        console.log('PDF generated successfully!');
        
        // Write metadata for App.tsx
        const metaContent = `export const PDF_FILENAME = "${filename}";\n`;
        fs.writeFileSync(metaPath, metaContent);
        console.log(`Metadata written to ${metaPath}`);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        process.exit(1);
    }
}
