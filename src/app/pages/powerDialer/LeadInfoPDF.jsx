import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

const LeadInfoPDF = ({ formData }) => {
  const handleDownloadPDF = async () => {
    if (!formData) {
      console.error('No form data available');
      return;
    }

    try {
      // Create a simplified version for PDF generation without modern CSS
      const pdfContent = document.createElement('div');
      pdfContent.style.width = '210mm';
      pdfContent.style.minHeight = '297mm';
      pdfContent.style.padding = '20px';
      pdfContent.style.backgroundColor = '#ffffff';
      pdfContent.style.fontFamily = 'Arial, sans-serif';
      pdfContent.style.color = '#000000';
      pdfContent.style.position = 'fixed';
      pdfContent.style.left = '-9999px';
      pdfContent.style.top = '0';

      // Header Section
      const header = document.createElement('div');
      header.style.textAlign = 'center';
      header.style.marginBottom = '20px';
      header.style.borderBottom = '2px solid #2563eb';
      header.style.paddingBottom = '10px';
      
      const title = document.createElement('h1');
      title.textContent = 'Mortgage Protection Assessment';
      title.style.fontSize = '24px';
      title.style.fontWeight = 'bold';
      title.style.color = '#1e40af';
      title.style.margin = '0';
      
      const subtitle = document.createElement('p');
      subtitle.textContent = 'Confidential Client Report';
      subtitle.style.color = '#6b7280';
      subtitle.style.fontSize = '14px';
      subtitle.style.margin = '5px 0 0 0';
      
      header.appendChild(title);
      header.appendChild(subtitle);
      pdfContent.appendChild(header);

      // Main Content Grid
      const grid = document.createElement('div');
      grid.style.display = 'grid';
      grid.style.gridTemplateColumns = '1fr 1fr';
      grid.style.gap = '20px';
      grid.style.marginBottom = '20px';

      // Left Column - Verifying Information
      const leftColumn = document.createElement('div');
      leftColumn.style.backgroundColor = '#dbeafe';
      leftColumn.style.padding = '15px';
      leftColumn.style.borderRadius = '8px';
      leftColumn.style.border = '1px solid #93c5fd';

      const leftTitle = document.createElement('h2');
      leftTitle.textContent = 'Verifying Information';
      leftTitle.style.fontSize = '18px';
      leftTitle.style.fontWeight = 'bold';
      leftTitle.style.color = '#1e40af';
      leftTitle.style.marginBottom = '15px';
      leftTitle.style.borderBottom = '1px solid #93c5fd';
      leftTitle.style.paddingBottom = '5px';
      leftColumn.appendChild(leftTitle);

      // Health Section
      const healthSection = createSection('Health', formData.verification, [
        { key: 'age', label: 'Age' },
        { key: 'height', label: 'Height (inches)' },
        { key: 'weight', label: 'Weight (lbs)' },
        { key: 'heartAttack', label: 'Heart Attack', isYesNo: true },
        { key: 'stroke', label: 'Stroke', isYesNo: true },
        { key: 'cancer', label: 'Cancer', isYesNo: true },
        { key: 'sterils', label: 'Stents', isYesNo: true },
        { key: 'diabetes', label: 'Diabetes', isYesNo: true },
        { key: 'diabetesComplications', label: 'Diabetes Complications', isYesNo: true },
        { key: 'highBloodPressure', label: 'High Blood Pressure', isYesNo: true },
        { key: 'highCholesterol', label: 'High Cholesterol', isYesNo: true },
        { key: 'kidneyLiverDisease', label: 'Kidney/Liver Disease', isYesNo: true },
        { key: 'anxietyDepression', label: 'Anxiety/Depression', isYesNo: true },
        { key: 'thyroid', label: 'Thyroid', isYesNo: true },
        { key: 'asthmaCOPD', label: 'Asthma/COPD', isYesNo: true },
        { key: 'lupusFA', label: 'Lupus or RA', isYesNo: true },
      ]);
      leftColumn.appendChild(healthSection);

      // Lifestyle Section
      const lifestyleSection = createSection('Lifestyle', formData.verification, [
        { key: 'licenseSuspensions', label: 'License Suspensions', isYesNo: true },
        { key: 'speedingTickets', label: 'Speeding Tickets', isYesNo: true },
        { key: 'duiDwi', label: 'DUI/DWI', isYesNo: true },
        { key: 'felonyProbationParole', label: 'Felony/Probation/Parole', isYesNo: true },
      ]);
      leftColumn.appendChild(lifestyleSection);

      // Occupation Section
      const occupationSection = createSection('Occupation', formData.verification, [
        { key: 'occupation', label: 'Status', customValue: formData.verification.occupation === 'retired' ? 'Retired' : formData.verification.occupation === 'working' ? 'Working' : 'Not specified' }
      ]);
      leftColumn.appendChild(occupationSection);

      // Prescription Medications
      const medsSection = document.createElement('div');
      medsSection.style.marginBottom = '15px';
      
      const medsTitle = document.createElement('h3');
      medsTitle.textContent = 'Prescription Medications Prescribed';
      medsTitle.style.fontSize = '16px';
      medsTitle.style.fontWeight = 'bold';
      medsTitle.style.color = '#1e40af';
      medsTitle.style.marginBottom = '8px';
      medsSection.appendChild(medsTitle);
      
      const medsContent = document.createElement('div');
      medsContent.textContent = formData.verification.prescriptionMeds || 'None specified';
      medsContent.style.backgroundColor = '#ffffff';
      medsContent.style.padding = '10px';
      medsContent.style.borderRadius = '4px';
      medsContent.style.border = '1px solid #d1d5db';
      medsContent.style.minHeight = '40px';
      medsSection.appendChild(medsContent);
      
      leftColumn.appendChild(medsSection);

      // Right Column - Financial Risk
      const rightColumn = document.createElement('div');
      rightColumn.style.backgroundColor = '#dcfce7';
      rightColumn.style.padding = '15px';
      rightColumn.style.borderRadius = '8px';
      rightColumn.style.border = '1px solid #86efac';

      const rightTitle = document.createElement('h2');
      rightTitle.textContent = 'Financial Risk';
      rightTitle.style.fontSize = '18px';
      rightTitle.style.fontWeight = 'bold';
      rightTitle.style.color = '#166534';
      rightTitle.style.marginBottom = '15px';
      rightTitle.style.borderBottom = '1px solid #86efac';
      rightTitle.style.paddingBottom = '5px';
      rightColumn.appendChild(rightTitle);

      // Payoff Section
      const payoffSection = createSection('Payoff', formData.financial, [
        { key: 'equity', label: 'Equity', isCurrency: true }
      ], '#166534');
      rightColumn.appendChild(payoffSection);

      // Fall Back Assets
      const assetsSection = createSection('Fall Back Assets', formData.financial, [
        { key: 'checking', label: 'Checking', isCurrency: true },
        { key: 'savings', label: 'Savings', isCurrency: true },
        { key: 'retirement401k', label: '401K', isCurrency: true },
        { key: 'ira', label: 'IRA', isCurrency: true },
        { key: 'annuities', label: 'Annuities', isCurrency: true },
      ], '#166534');
      rightColumn.appendChild(assetsSection);

      // Major Bills
      const billsSection = document.createElement('div');
      billsSection.style.marginBottom = '15px';
      
      const billsTitle = document.createElement('h3');
      billsTitle.textContent = 'Major Bills';
      billsTitle.style.fontSize = '16px';
      billsTitle.style.fontWeight = 'bold';
      billsTitle.style.color = '#166534';
      billsTitle.style.marginBottom = '8px';
      billsSection.appendChild(billsTitle);
      
      const billsGrid = document.createElement('div');
      billsGrid.style.display = 'grid';
      billsGrid.style.gridTemplateColumns = '1fr 1fr';
      billsGrid.style.gap = '10px';
      billsGrid.style.fontSize = '12px';
      
      const leftBills = [
        { label: 'Monthly mortgage & property taxes', value: formData.financial.mortgagePropertyTax },
        { label: 'Car Payments', value: formData.financial.carPayments },
        { label: 'Electric/Gas', value: formData.financial.electricGas },
        { label: 'Water', value: formData.financial.water },
        { label: 'Other Bills', value: formData.financial.otherLoans },
      ];
      
      const rightBills = [
        { label: 'Cable Internet', value: formData.financial.cableInternet },
        { label: 'Cell Phone', value: formData.financial.cellPhone },
        { label: 'Car Insurance', value: formData.financial.carInsurance },
        { label: 'Gas for car', value: formData.financial.gasForCar },
        { label: 'Food', value: formData.financial.food },
        { label: 'Other loans', value: formData.financial.otherLoans },
      ];
      
      leftBills.forEach(bill => {
        const billRow = createBillRow(bill.label, bill.value);
        billsGrid.appendChild(billRow);
      });
      
      rightBills.forEach(bill => {
        const billRow = createBillRow(bill.label, bill.value);
        billsGrid.appendChild(billRow);
      });
      
      billsSection.appendChild(billsGrid);
      rightColumn.appendChild(billsSection);

      grid.appendChild(leftColumn);
      grid.appendChild(rightColumn);
      pdfContent.appendChild(grid);

      // Footer
      const footer = document.createElement('div');
      footer.style.marginTop = '20px';
      footer.style.paddingTop = '10px';
      footer.style.borderTop = '1px solid #d1d5db';
      footer.style.textAlign = 'center';
      footer.style.color = '#6b7280';
      footer.style.fontSize = '10px';
      footer.textContent = `Generated by StarterPro Leads | Confidential Report | ${new Date().toLocaleDateString()}`;
      pdfContent.appendChild(footer);

      document.body.appendChild(pdfContent);

      // Capture with html2canvas
      const canvas = await html2canvas(pdfContent, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pageWidth - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth, pdfHeight);
      pdf.save('mortgage-protection-assessment.pdf');

      // Clean up
      document.body.removeChild(pdfContent);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback: Generate simple PDF without html2canvas
      generateSimplePDF(formData);
    }
  };

  // Helper function to create sections
  const createSection = (title, data, fields, titleColor = '#1e40af') => {
    const section = document.createElement('div');
    section.style.marginBottom = '15px';
    
    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = title;
    sectionTitle.style.fontSize = '16px';
    sectionTitle.style.fontWeight = 'bold';
    sectionTitle.style.color = titleColor;
    sectionTitle.style.marginBottom = '8px';
    section.appendChild(sectionTitle);
    
    fields.forEach(field => {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.marginBottom = '4px';
      row.style.fontSize = '12px';
      
      const label = document.createElement('span');
      label.textContent = field.label + ':';
      label.style.fontWeight = '600';
      
      const value = document.createElement('span');
      
      if (field.customValue) {
        value.textContent = field.customValue;
      } else if (field.isYesNo) {
        value.textContent = data[field.key] === 'yes' ? 'Yes' : data[field.key] === 'no' ? 'No' : 'Not specified';
      } else if (field.isCurrency) {
        value.textContent = formatCurrency(data[field.key]);
      } else {
        value.textContent = data[field.key] || 'Not specified';
      }
      
      row.appendChild(label);
      row.appendChild(value);
      section.appendChild(row);
    });
    
    return section;
  };

  // Helper function to create bill rows
  const createBillRow = (label, value) => {
    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.justifyContent = 'space-between';
    row.style.marginBottom = '2px';
    
    const labelSpan = document.createElement('span');
    labelSpan.textContent = label;
    
    const valueSpan = document.createElement('span');
    valueSpan.textContent = formatCurrency(value);
    
    row.appendChild(labelSpan);
    row.appendChild(valueSpan);
    return row;
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '$0';
    return '$' + parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Fallback PDF generation without html2canvas
  const generateSimplePDF = (formData) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Mortgage Protection Assessment', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Confidential Client Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Simple data display
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Verifying Information', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Age: ${formData.verification.age || 'Not specified'}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Health Conditions: Various`, 25, yPosition);
    yPosition += 10;

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Financial Risk', 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Equity: ${formatCurrency(formData.financial.equity)}`, 25, yPosition);
    yPosition += 6;
    pdf.text(`Assets: Various`, 25, yPosition);

    pdf.save('mortgage-protection-simple.pdf');
  };

  return (
    <button
      onClick={handleDownloadPDF}
      className="flex items-center gap-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium transition-colors duration-200"
      title="Click here to download Mortgage Protection"
    >
      <DocumentArrowDownIcon className="w-4 h-4" />
    </button>
  );
};

export default LeadInfoPDF;