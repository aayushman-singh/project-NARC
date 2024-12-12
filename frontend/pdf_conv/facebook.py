from pymongo import MongoClient
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, landscape
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
from reportlab.lib.pagesizes import A4

# MongoDB Configuration
MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "facebookDB"
COLLECTION_NAME = "facebook_users"

class FacebookDataReport:
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
            alignment=1,  # Center alignment
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
        """Process and read content from a text file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            print(f"Error reading text file {file_path}: {str(e)}")
            return "Error reading file content"

    def format_friends_section(self, friends):
        """Format friends section for the report."""
        story = []
        story.append(Paragraph("KNOWN ASSOCIATES", self.styles['SectionHeader']))
        story.append(Spacer(1, 20))

        for friend in friends:
            story.append(Paragraph(f"Associate #{friend['index']}", self.styles['DataHeader']))
            story.append(Paragraph(f"Name: {friend['userName']}", self.styles['Content']))
            story.append(Paragraph(f"Profile: {friend['profileUrl']}", self.styles['Content']))
            
            if friend.get('profilePicUrl'):
                local_path = self.download_file(friend['profilePicUrl'])
                if local_path and local_path.endswith(('.jpg', '.jpeg', '.png')):
                    img = Image(local_path, width=2*inch, height=2*inch)
                    story.append(img)
                    story.append(Paragraph(
                        f"Evidence ID: ASSOC-{datetime.now().strftime('%Y%m%d')}-{friend['index']}", 
                        self.styles['EvidenceLabel']
                    ))
            
            story.append(Spacer(1, 20))

        return story

    def format_posts_section(self, posts):
        """Format posts section with new post structure."""
        story = []
        story.append(Paragraph("DIGITAL CONTENT", self.styles['SectionHeader']))
        story.append(Spacer(1, 20))

        # Sort posts by their numerical order
        post_keys = sorted(posts.keys(), key=lambda x: int(x.split('_')[1]))
        
        for post_key in post_keys:
            post_data = posts[post_key]
            post_number = post_key.split('_')[1]
            
            story.append(Paragraph(f"Post Evidence #{post_number}", self.styles['DataHeader']))
            
            # Handle PNG URL
            if post_data.get('png'):
                local_path = self.download_file(post_data['png'])
                if local_path:
                    try:
                        img = Image(local_path, width=6*inch, height=4*inch)
                        story.append(img)
                        story.append(Paragraph(
                            f"Evidence ID: POST-{datetime.now().strftime('%Y%m%d')}-{post_number}", 
                            self.styles['EvidenceLabel']
                        ))
                    except Exception as e:
                        story.append(Paragraph(f"Error displaying image: {str(e)}", self.styles['Content']))
            
            story.append(Spacer(1, 30))

        return story

    def format_chats_section(self, chats):
        """Format chats section for the report."""
        story = []
        story.append(Paragraph("COMMUNICATION RECORDS", self.styles['SectionHeader']))
        story.append(Spacer(1, 20))

        for idx, chat in enumerate(chats, 1):
            story.append(Paragraph(f"Communication with: {chat['receiverUsername']}", self.styles['DataHeader']))
            
            if chat.get('chats'):
                chat_log_path = self.download_file(chat['chats'])
                if chat_log_path:
                    content = self.process_text_file(chat_log_path)
                    story.append(Paragraph("Message Log:", self.styles['Content']))
                    story.append(Paragraph(content, self.styles['Content']))
                    story.append(Paragraph(
                        f"Evidence ID: CHAT-{datetime.now().strftime('%Y%m%d')}-{idx}", 
                        self.styles['EvidenceLabel']
                    ))
            
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
            story.append(Paragraph("Facebook Account Investigation", self.styles['OfficialHeader']))
            story.append(Spacer(1, 40))
            
            # Case Information
            story.append(Paragraph("CASE DETAILS", self.styles['SectionHeader']))
            story.append(Paragraph(f"Subject Username: {username}", self.styles['DataHeader']))
            story.append(Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.styles['Content']))
            story.append(Paragraph(f"Report Reference: FB-{datetime.now().strftime('%Y%m%d-%H%M%S')}", self.styles['Content']))
            story.append(Spacer(1, 20))

            # Profile Picture
            if user_data.get('profile'):
                story.append(Paragraph("SUBJECT PROFILE IMAGE", self.styles['SectionHeader']))
                local_path = self.download_file(user_data['profile'])
                if local_path and local_path.endswith(('.jpg', '.jpeg', '.png')):
                    img = Image(local_path, width=3*inch, height=3*inch)
                    story.append(img)
                    story.append(Paragraph(f"Evidence ID: PRF-{datetime.now().strftime('%Y%m%d')}-01", 
                                        self.styles['EvidenceLabel']))
            
            story.append(PageBreak())

            # Evidence Index
            story.append(Paragraph("EVIDENCE INDEX", self.styles['SectionHeader']))
            story.append(Paragraph("1. Profile Information", self.styles['DataHeader']))
            story.append(Paragraph("2. Known Associates (Friends List)", self.styles['DataHeader']))
            story.append(Paragraph("3. Timeline Activity (Posts)", self.styles['DataHeader']))
            story.append(Paragraph("4. Communications (Chat History)", self.styles['DataHeader']))
            story.append(PageBreak())

            # Add Friends Section
            if user_data.get('friends_list'):
                story.extend(self.format_friends_section(user_data['friends_list']))
                story.append(PageBreak())

            # Add Posts Section with new format
            post_keys = [k for k in user_data.keys() if k.startswith('post_')]
            if post_keys:
                posts_data = {k: user_data[k] for k in post_keys}
                story.extend(self.format_posts_section(posts_data))
                story.append(PageBreak())

            # Add Chats Section
            if user_data.get('chats'):
                story.extend(self.format_chats_section(user_data['chats']))

            # Add footer to each page
            def add_page_number(canvas, doc):
                canvas.saveState()
                canvas.setFont('Helvetica', 9)
                page_num = canvas.getPageNumber()
                text = f"Page {page_num} | CONFIDENTIAL | Case Reference: FB-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
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
        report_generator = FacebookDataReport()
        username = input("Enter username to generate report for: ")
        output_dir = "reports"
        output_path = os.path.join(output_dir, f"facebook_report_{username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        report_generator.generate_report(username, output_path)
    except Exception as e:
        print(f"Error in main: {str(e)}")
    finally:
        if 'report_generator' in locals():
            report_generator.client.close()

if __name__ == "__main__":
    main()