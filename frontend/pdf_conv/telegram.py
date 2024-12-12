import os
import re
import pymongo
import requests
import tempfile
import shutil
from urllib.parse import urlparse
import time
from datetime import datetime
from pymongo import MongoClient
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus.paragraph import Paragraph

# MongoDB connection setup
MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "telegramDB"
COLLECTION_NAME = "telegram_users"

class TelegramDataReport:
    def __init__(self):
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DATABASE_NAME]
            self.collection = self.db[COLLECTION_NAME]
            self.temp_dir = tempfile.mkdtemp()
            self.client.server_info()
            print(f"Successfully connected to MongoDB database: {DATABASE_NAME}")
        except Exception as e:
            print(f"Error connecting to MongoDB: {str(e)}")
            raise
        
        # Use getSampleStyleSheet directly
        self.styles = getSampleStyleSheet()
        self._init_custom_styles()

    def _init_custom_styles(self):
        """Initialize custom styles for the PDF."""
        # Ensure basic styles exist
        if 'Normal' not in self.styles:
            self.styles.add(ParagraphStyle(
                'Normal', 
                parent=None,
                fontSize=11,
                leading=13,
                textColor=colors.black
            ))

        # Title Style
        self.styles.add(ParagraphStyle(
            name='CaseTitle',
            parent=self.styles['Heading1'],
            fontSize=28,
            spaceAfter=30,
            textColor=colors.black,
            alignment=1,  # Center alignment
        ))
        
        # Official Header Style
        self.styles.add(ParagraphStyle(
            name='OfficialHeader',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=20,
            textColor=colors.black,
            borderWidth=2,
            borderColor=colors.black,
            borderPadding=15,
            backColor=colors.HexColor('#F5F5F5'),
            alignment=1,
        ))
        
        # Section Headers
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            spaceAfter=15,
            textColor=colors.black,
            borderWidth=1,
            borderColor=colors.black,
            borderPadding=8,
            backColor=colors.HexColor('#E8E8E8'),
        ))
        
        # Data Headers
        self.styles.add(ParagraphStyle(
            name='DataHeader',
            parent=self.styles['Heading3'],
            fontSize=12,
            spaceAfter=10,
            textColor=colors.black,
        ))
        
        # Content Style (Fallback to Normal if not exists)
        if 'Content' not in self.styles:
            self.styles.add(ParagraphStyle(
                name='Content',
                parent=self.styles['Normal'],
                fontSize=11,
                spaceAfter=8,
            ))
        
        # Evidence Label Style
        self.styles.add(ParagraphStyle(
            name='EvidenceLabel',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#666666'),
            fontName='Helvetica-Oblique'
        ))

        # Chat Message Style
        self.styles.add(ParagraphStyle(
            'ChatMessage',
            parent=self.styles['Normal'],
            alignment=TA_LEFT,
            fontSize=10,
            leading=12
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
            elif 'text' in content_type:
                if not filename.endswith('.txt'):
                    filename += '.txt'
            
            local_path = os.path.join(self.temp_dir, filename)
            
            with open(local_path, 'wb') as f:
                shutil.copyfileobj(response.raw, f)
            
            return local_path
        except Exception as e:
            print(f"Error downloading file from {url}: {str(e)}")
            return None

    def process_text_file(self, file_path):
        """
        Process and read content from a text file with enhanced formatting.
        - Each message on a new line
        - Highlighted clickable URLs
        """
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Split content into individual messages
            messages = content.split('\n')
            
            # Process each message
            formatted_messages = []
            for msg in messages:
                # Create a list to store parts of the message
                message_parts = []
                
                # Find URLs in the message
                url_pattern = r'(https?://\S+)'
                last_end = 0
                
                for match in re.finditer(url_pattern, msg):
                    # Add text before the URL
                    if match.start() > last_end:
                        message_parts.append(('text', msg[last_end:match.start()]))
                    
                    # Add the URL with hyperlink styling
                    message_parts.append(('link', match.group(1)))
                    
                    last_end = match.end()
                
                # Add any remaining text after the last URL
                if last_end < len(msg):
                    message_parts.append(('text', msg[last_end:]))
                
                # Reconstruct the message with proper formatting
                formatted_msg = ''
                for part_type, part_text in message_parts:
                    if part_type == 'text':
                        # Escape special characters for regular text
                        formatted_text = part_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        formatted_msg += formatted_text
                    else:
                        # Create a clickable, highlighted link
                        safe_url = part_text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                        formatted_msg += f'<link href="{safe_url}"><font color="blue"><u>{safe_url}</u></font></link>'
                
                formatted_messages.append(formatted_msg)
            
            return '\n'.join(formatted_messages)
        
        except Exception as e:
            print(f"Error reading text file {file_path}: {str(e)}")
            return "Error reading file content"

    def format_chats_section(self, chats):
        """Format chats section for the report."""
        story = []
        story.append(Paragraph("COMMUNICATION RECORDS", self.styles['SectionHeader']))
        story.append(Spacer(1, 20))

        for idx, chat in enumerate(chats, 1):
            story.append(Paragraph(f"Communication with: {chat['receiverUsername']}", self.styles['DataHeader']))
            
            # Chat Logs
            if chat.get('logs'):
                chat_log_path = self.download_file(chat['logs'])
                if chat_log_path:
                    content = self.process_text_file(chat_log_path)
                    
                    # Create a custom style for chat messages with left alignment and word wrapping
                    chat_message_style = ParagraphStyle(
                        'ChatMessage',
                        parent=self.styles['Content'],
                        alignment=TA_LEFT,
                        wordWrap=True,
                        fontSize=10,
                        leading=12
                    )
                    
                    story.append(Paragraph("Message Log:", self.styles['Content']))
                    
                    # Split messages and add each as a separate paragraph
                    messages = content.split('\n')
                    for msg in messages:
                        if msg.strip():  # Only add non-empty messages
                            story.append(Paragraph(msg, chat_message_style))
                    
                    story.append(Paragraph(
                        f"Evidence ID: CHAT-{datetime.now().strftime('%Y%m%d')}-{idx}", 
                        self.styles['EvidenceLabel']
                    ))
            
            if chat.get('media_files'):
                story.append(Paragraph("Visual Evidence:", self.styles['Content']))
                for screen_idx, media_url in enumerate(chat['media_files'], 1):
                    local_path = self.download_file(media_url)
                    if local_path and local_path.endswith(('.jpg', '.jpeg', '.png')):
                        img = Image(local_path, width=6*inch, height=4*inch)
                        story.append(img)
                        story.append(Paragraph(
                            f"Evidence ID: MEDIA-{datetime.now().strftime('%Y%m%d')}-{idx}-{screen_idx}", 
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
            story.append(Paragraph("Telegram Account Investigation", self.styles['OfficialHeader']))
            story.append(Spacer(1, 40))
            
            # Case Information
            story.append(Paragraph("CASE DETAILS", self.styles['SectionHeader']))
            story.append(Paragraph(f"Subject Username: {username}", self.styles['DataHeader']))
            story.append(Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.styles['Content']))
            story.append(Paragraph(f"Report Reference: TG-{datetime.now().strftime('%Y%m%d-%H%M%S')}", self.styles['Content']))
            story.append(Spacer(1, 20))

            # Evidence Index
            story.append(Paragraph("EVIDENCE INDEX", self.styles['SectionHeader']))
            story.append(Paragraph("1. Subject Information", self.styles['DataHeader']))
            story.append(Paragraph("2. Communications (Chat History)", self.styles['DataHeader']))
            story.append(PageBreak())

            # Add Chats Section
            if user_data.get('chats'):
                story.extend(self.format_chats_section(user_data['chats']))

            # Add footer to each page
            def add_page_number(canvas, doc):
                canvas.saveState()
                canvas.setFont('Helvetica', 9)
                page_num = canvas.getPageNumber()
                text = f"Page {page_num} | CONFIDENTIAL | Case Reference: TG-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
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
        report_generator = TelegramDataReport()
        username = input("Enter username to generate report for: ")
        output_dir = "reports"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"telegram_report_{username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        report_generator.generate_report(username, output_path)
    except Exception as e:
        print(f"Error in main: {str(e)}")
    finally:
        if 'report_generator' in locals():
            report_generator.client.close()

if __name__ == "__main__":
    main()