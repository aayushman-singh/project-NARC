from pymongo import MongoClient
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.units import inch
from datetime import datetime
import os
import requests
import tempfile
import shutil
from urllib.parse import urlparse
import time

class WhatsAppDataReport:
    def __init__(self):
        # MongoDB Configuration
        self.MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
        self.DATABASE_NAME = "whatsappDB"
        self.COLLECTION_NAME = "whatsapp_users"

        try:
            self.client = MongoClient(self.MONGO_URI)
            self.db = self.client[self.DATABASE_NAME]
            self.collection = self.db[self.COLLECTION_NAME]
            self.temp_dir = tempfile.mkdtemp()
            self.client.server_info()
            print(f"Successfully connected to MongoDB database: {self.DATABASE_NAME}")
        except Exception as e:
            print(f"Error connecting to MongoDB: {str(e)}")
            raise
        
        self.styles = getSampleStyleSheet()
        self._init_styles()

    def _init_styles(self):
        """Initialize custom styles for the PDF."""
        # Title Style
        self.styles.add(ParagraphStyle(
            name='CaseTitle',
            parent=self.styles['Heading1'],
            fontSize=28,
            spaceAfter=30,
            textColor=colors.HexColor('#000000'),
            alignment=1,
            fontName='Helvetica-Bold'
        ))
        
        # Official Header Style
        self.styles.add(ParagraphStyle(
            name='OfficialHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            textColor=colors.HexColor('#000000'),
            borderWidth=2,
            borderColor=colors.HexColor('#000000'),
            borderPadding=15,
            backColor=colors.HexColor('#F5F5F5'),
            alignment=1,
            fontName='Helvetica-Bold'
        ))
        
        # Section Headers
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=15,
            textColor=colors.HexColor('#000000'),
            borderWidth=1,
            borderColor=colors.HexColor('#000000'),
            borderPadding=8,
            backColor=colors.HexColor('#E8E8E8'),
            fontName='Helvetica-Bold'
        ))
        
        # Data Headers
        self.styles.add(ParagraphStyle(
            name='DataHeader',
            parent=self.styles['Heading3'],
            fontSize=12,
            spaceAfter=10,
            textColor=colors.HexColor('#000000'),
            fontName='Helvetica-Bold'
        ))
        
        # Content Style
        self.styles.add(ParagraphStyle(
            name='Content',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            textColor=colors.HexColor('#000000'),
            fontName='Helvetica'
        ))
        
        # Chat Content Style
        self.styles.add(ParagraphStyle(
            name='ChatContent',
            parent=self.styles['Content'],
            fontSize=11,
            spaceAfter=8,
            textColor=colors.HexColor('#000000'),
            fontName='Helvetica',
            allowWidows=0,
            allowOrphans=0
        ))
        
        # Evidence Label Style
        self.styles.add(ParagraphStyle(
            name='EvidenceLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#666666'),
            fontName='Helvetica-Oblique'
        ))

    def download_file(self, url):
        """Download a file from URL and return the local path."""
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            filename = os.path.basename(urlparse(url).path)
            if not filename:
                filename = f"file_{int(time.time())}"
            
            content_type = response.headers.get('content-type', '')
            if 'image' in content_type or url.endswith(('.png', '.jpg', '.jpeg')):
                if not filename.endswith(('.jpg', '.png', '.jpeg')):
                    filename += '.png'
            elif 'text' in content_type or url.endswith('.txt'):
                if not filename.endswith('.txt'):
                    filename += '.txt'
            
            local_path = os.path.join(self.temp_dir, filename)
            
            with open(local_path, 'wb') as f:
                shutil.copyfileobj(response.raw, f)
            
            return local_path
        except Exception as e:
            print(f"Error downloading file from {url}: {str(e)}")
            return None

    def process_chat_log(self, file_path):
        """Process and read content from a chat log file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
                # Split content into lines and process
                lines = content.split('\n')
                processed_lines = []
                
                for line in lines:
                    line = line.strip()
                    if line:  # Skip empty lines
                        # Make message numbers bold using reportlab markup
                        # Check if line starts with "Message" followed by a number
                        if line.lower().startswith('message'):
                            # Find the position of the first colon
                            colon_pos = line.find(':')
                            if colon_pos != -1:
                                # Make the "Message X" part bold
                                message_header = line[:colon_pos]
                                message_content = line[colon_pos:]
                                formatted_line = f'<b>{message_header}</b>{message_content}'
                                processed_lines.append(formatted_line)
                            else:
                                processed_lines.append(line)
                        else:
                            processed_lines.append(line)
                        processed_lines.append('')  # Add empty line after each message
                
                # Join lines back together
                processed_content = '\n'.join(processed_lines)
                
                # Limit content length for PDF
                if len(processed_content) > 2000:
                    truncate_point = processed_content[:2000].rfind('\n\n')
                    if truncate_point == -1:
                        truncate_point = 2000
                    processed_content = processed_content[:truncate_point] + "\n\n[Content truncated...]"
                
                return processed_content
        except Exception as e:
            print(f"Error reading chat log {file_path}: {str(e)}")
            return "Error reading chat content"
        
    def format_screenshots_section(self, chats):
        """Format screenshots section for the report."""
        story = []
        story.append(Paragraph("VISUAL EVIDENCE", self.styles['SectionHeader']))
        story.append(Spacer(1, 20))

        for chat_idx, chat in enumerate(chats, 1):
            if chat.get('screenshots'):
                story.append(Paragraph(f"Communication #{chat_idx} - Participant: {chat['receiverUsername']}", self.styles['DataHeader']))
                story.append(Spacer(1, 10))
                
                for screen_idx, screenshot_url in enumerate(chat['screenshots'], 1):
                    local_path = self.download_file(screenshot_url)
                    if local_path and local_path.endswith(('.jpg', '.jpeg', '.png')):
                        img = Image(local_path, width=6*inch, height=4*inch)
                        story.append(img)
                        story.append(Paragraph(
                            f"Evidence ID: SCRN-{datetime.now().strftime('%Y%m%d')}-{chat_idx}-{screen_idx}",
                            self.styles['EvidenceLabel']
                        ))
                        story.append(Spacer(1, 20))
                
                story.append(PageBreak())

        return story    

    def format_chat_section(self, chats):
        """Format chats section for the report."""
        story = []
        story.append(Paragraph("COMMUNICATION RECORDS", self.styles['SectionHeader']))
        story.append(Spacer(1, 20))

        for idx, chat in enumerate(chats, 1):
            # Chat Header
            story.append(Paragraph(f"Communication #{idx}", self.styles['DataHeader']))
            story.append(Paragraph(f"Participant: {chat['receiverUsername']}", self.styles['Content']))
            story.append(Spacer(1, 10))

            # Chat Log
            if 'chats' in chat and chat['chats'].startswith('http'):
                local_path = self.download_file(chat['chats'])
                if local_path:
                    content = self.process_chat_log(local_path)
                    story.append(Paragraph("Message Log:", self.styles['Content']))
                    # Split content into paragraphs and create separate Paragraph objects
                    for line in content.split('\n'):
                        if line.strip():  # Only add non-empty lines
                            story.append(Paragraph(line, self.styles['ChatContent']))
                    story.append(Paragraph(
                        f"Evidence ID: CHAT-{datetime.now().strftime('%Y%m%d')}-{idx}",
                        self.styles['EvidenceLabel']
                    ))

            # Screenshots
            if chat.get('screenshots'):
                story.append(Paragraph("Visual Evidence:", self.styles['Content']))
                for screen_idx, screenshot_url in enumerate(chat['screenshots'], 1):
                    local_path = self.download_file(screenshot_url)
                    if local_path and local_path.endswith(('.jpg', '.jpeg', '.png')):
                        img = Image(local_path, width=6*inch, height=4*inch)
                        story.append(img)
                        story.append(Paragraph(
                            f"Evidence ID: SCRN-{datetime.now().strftime('%Y%m%d')}-{idx}-{screen_idx}",
                            self.styles['EvidenceLabel']
                        ))
                        story.append(Spacer(1, 10))

            story.append(PageBreak())

        return story

    def generate_report(self, username, output_path):
        """Generate the complete report."""
        try:
            user_data = self.collection.find_one({"username": username})
            if not user_data:
                raise ValueError(f"No data found for username: {username}")

            os.makedirs(os.path.dirname(output_path) if os.path.dirname(output_path) else '.', exist_ok=True)

            doc = SimpleDocTemplate(
                output_path,
                pagesize=A4,
                rightMargin=50,
                leftMargin=50,
                topMargin=50,
                bottomMargin=50
            )

            story = []

            # Official Header Page
            story.append(Paragraph("CONFIDENTIAL", self.styles['CaseTitle']))
            story.append(Spacer(1, 30))
            story.append(Paragraph("Digital Evidence Report", self.styles['OfficialHeader']))
            story.append(Spacer(1, 20))
            story.append(Paragraph("WhatsApp Account Investigation", self.styles['OfficialHeader']))
            story.append(Spacer(1, 40))
            
            # Case Information
            story.append(Paragraph("CASE DETAILS", self.styles['SectionHeader']))
            story.append(Paragraph(f"Subject Username: {username}", self.styles['DataHeader']))
            story.append(Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.styles['Content']))
            story.append(Paragraph(f"Report Reference: WA-{datetime.now().strftime('%Y%m%d-%H%M%S')}", self.styles['Content']))
            story.append(PageBreak())

            # Evidence Index
            story.append(Paragraph("1. Subject Information", self.styles['DataHeader']))
            story.append(Paragraph("2. Visual Evidence (Screenshots)", self.styles['DataHeader']))
            story.append(Paragraph("3. Communications (Chat History)", self.styles['DataHeader']))

            # Add Chats Section
            if user_data.get('chats'):
            # First add screenshots
             story.extend(self.format_screenshots_section(user_data['chats']))
            # Then add chat logs
            story.extend(self.format_chat_section(user_data['chats']))

            # Add footer to each page
            def add_page_number(canvas, doc):
                canvas.saveState()
                canvas.setFont('Helvetica', 9)
                page_num = canvas.getPageNumber()
                text = f"Page {page_num} | CONFIDENTIAL | Case Reference: WA-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
                canvas.drawString(doc.leftMargin, doc.bottomMargin - 20, text)
                canvas.restoreState()

            doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
            print(f"Report generated successfully: {output_path}")

        except Exception as e:
            print(f"Error generating report: {str(e)}")
            raise
        finally:
            try:
                shutil.rmtree(self.temp_dir)
            except Exception as e:
                print(f"Error cleaning up temporary files: {str(e)}")

def main():
    try:
        report_generator = WhatsAppDataReport()
        username = input("Enter username to generate report for: ")
        output_dir = "reports"
        output_path = os.path.join(output_dir, f"whatsapp_report_{username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        report_generator.generate_report(username, output_path)
    except Exception as e:
        print(f"Error in main: {str(e)}")
    finally:
        if 'report_generator' in locals():
            report_generator.client.close()

if __name__ == "__main__":
    main()