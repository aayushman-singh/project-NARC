from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.enums import TA_LEFT
import pymongo
from datetime import datetime
import os
import tempfile
import requests
import shutil
from urllib.parse import urlparse
import re

# MongoDB Connection Constants
MONGO_URI = "mongodb+srv://aayushman2702:Lmaoded%4011@cluster0.eivmu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
DATABASE_NAME = "instagramDB"
COLLECTION_NAME = "instagram_users"

class InstagramDataReport:
    def __init__(self):
        try:
            self.client = pymongo.MongoClient(MONGO_URI)
            self.db = self.client[DATABASE_NAME]
            self.collection = self.db[COLLECTION_NAME]
            self.temp_dir = tempfile.mkdtemp()
            print(f"Successfully connected to MongoDB database: {DATABASE_NAME}")
        except Exception as e:
            print(f"Error connecting to MongoDB: {str(e)}")
            raise
        
        self.styles = getSampleStyleSheet()
        self._init_custom_styles()

    def _init_custom_styles(self):
        """Initialize custom styles for the PDF."""
        # Ensure Normal style exists
        if 'Normal' not in self.styles:
            self.styles['Normal'] = ParagraphStyle(
                'Normal',
                fontName='Helvetica',
                fontSize=11,
                leading=13,
                textColor=colors.black
            )

        # Title Style
        self.styles.add(ParagraphStyle(
            name='CaseTitle',
            parent=self.styles['Normal'],
            fontSize=28,
            spaceAfter=30,
            textColor=colors.black,
            alignment=1,  # Center alignment
        ))
        
        # Official Header Style
        self.styles.add(ParagraphStyle(
            name='OfficialHeader',
            parent=self.styles['Normal'],
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
            parent=self.styles['Normal'],
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
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=10,
            textColor=colors.black,
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
                filename = f"file_{int(datetime.now().timestamp())}"
            
            local_path = os.path.join(self.temp_dir, filename)
            
            with open(local_path, 'wb') as f:
                shutil.copyfileobj(response.raw, f)
            
            return local_path
        except Exception as e:
            print(f"Error downloading file from {url}: {str(e)}")
            return None

    def format_cell_content(self, content, max_length=40):
        """Format cell content to prevent text overflow"""
        if isinstance(content, str):
            if content.startswith('http'):
                # Shorten URLs to keep only the last part
                parts = content.split('/')
                return f".../{parts[-1]}" if len(parts) > 1 else content[:max_length]
            return content if len(content) <= max_length else f"{content[:max_length]}..."
        return str(content)

    def format_user_data(self, user_data):
        """Format user data to show only username"""
        if isinstance(user_data, dict):
            return user_data.get('username', 'Unknown')
        return str(user_data)

    def create_user_profile_table(self, profile_data):
        """Create the user profile section of the PDF"""
        data = [
            ['Username', self.format_cell_content(profile_data.get('username', ''))],
            ['Full Name', self.format_cell_content(profile_data.get('fullName', ''))],
            ['Biography', self.format_cell_content(profile_data.get('biography', ''))],
            ['Followers Count', str(profile_data.get('followersCount', 0))],
            ['Follows Count', str(profile_data.get('followsCount', 0))],
            ['Has Channel', 'Yes' if profile_data.get('hasChannel', False) else 'No'],
            ['Highlight Reel Count', str(profile_data.get('highlightReelCount', 0))],
            ['Is Business Account', 'Yes' if profile_data.get('isBusinessAccount', False) else 'No'],
            ['ID', self.format_cell_content(profile_data.get('id', ''))]
        ]
        
        return Table(data, colWidths=[2*inch, 4*inch], rowHeights=[0.3*inch] * len(data))

    def create_posts_table(self, posts_data):
        """Create the posts section of the PDF with clickable hyperlinked URLs fitting in the table."""
        headers = ['Post URL', 'Type', 'Caption', 'Comments', 'Likes', 'Timestamp']
        data = [headers]
        
        for post in posts_data:
            post_url = post.get('url', 'N/A')
            
            # Shorten URL display but keep it clickable
            if post_url and post_url != 'N/A':
                url_display = post_url.split('/')[-1]  # Display only the last part
                formatted_url = f'<link href="{post_url}"><font color="blue"><u>{url_display}</u></font></link>'
            else:
                formatted_url = 'N/A'
            
            data.append([
                Paragraph(formatted_url, self.styles['Normal']),  # Ensure link is clickable
                self.format_cell_content(post.get('type', '')),
                self.format_cell_content(post.get('caption', ''), 30),
                str(post.get('commentsCount', 0)),
                str(post.get('likesCount', 0)),
                self.format_cell_content(post.get('timestamp', ''))
            ])
        
        # Adjusted column widths for better URL fitting
        colWidths = [3*inch, 0.8*inch, 2*inch, 0.8*inch, 0.8*inch, 1.5*inch]
        table = Table(data, colWidths=colWidths, rowHeights=[0.3*inch] * len(data))
        return table


    def create_followers_following_table(self, users, title):
        """Create a formatted table for followers or following"""
        data = [[title]]
        for user in users:
            username = self.format_user_data(user)
            data.append([username])
        
        return Table(data, colWidths=[6*inch], rowHeights=[0.3*inch] * len(data))

    def generate_report(self, username, output_path):
        """Generate the complete report."""
        try:
            # Fetch user data
            user_data = self.collection.find_one({'username': username})
            if not user_data:
                print(f"User {username} not found in the database")
                return
            
            # Create PDF document
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
            story.append(Paragraph("Instagram Account Investigation", self.styles['OfficialHeader']))
            story.append(Spacer(1, 40))
            
            # Case Information
            story.append(Paragraph("CASE DETAILS", self.styles['SectionHeader']))
            story.append(Paragraph(f"Subject Username: {username}", self.styles['DataHeader']))
            story.append(Paragraph(f"Report Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", self.styles['Normal']))
            story.append(Paragraph(f"Report Reference: IG-{datetime.now().strftime('%Y%m%d-%H%M%S')}", self.styles['Normal']))
            story.append(Spacer(1, 20))

            # Profile Picture
            profile = user_data.get('profile', [{}])[0]
            if profile.get('profilePicUrl'):
                story.append(Paragraph("SUBJECT PROFILE IMAGE", self.styles['SectionHeader']))
                local_path = self.download_file(profile['profilePicUrl'])
                if local_path:
                    img = Image(local_path, width=3*inch, height=3*inch)
                    story.append(img)
                    story.append(Paragraph(f"Evidence ID: PRF-{datetime.now().strftime('%Y%m%d')}-01", 
                                        self.styles['EvidenceLabel']))
            
            story.append(PageBreak())

            # Evidence Index
            story.append(Paragraph("EVIDENCE INDEX", self.styles['SectionHeader']))
            story.append(Paragraph("1. Profile Information", self.styles['DataHeader']))
            story.append(Paragraph("2. Timeline Activity (Posts)", self.styles['DataHeader']))
            story.append(Paragraph("3. Following List", self.styles['DataHeader']))
            story.append(PageBreak())

            # Add Profile Section
            story.append(Paragraph("USER PROFILE", self.styles['SectionHeader']))
            profile_table = self.create_user_profile_table(profile)
            profile_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            story.append(profile_table)
            story.append(Spacer(1, 20))
            
            # Add Posts Section
            story.append(Paragraph("DIGITAL CONTENT", self.styles['SectionHeader']))
            posts_table = self.create_posts_table(user_data.get('posts', []))
            posts_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ]))
            story.append(posts_table)
            story.append(Spacer(1, 20))
            
            # Add Following Section
            story.append(Paragraph("KNOWN ASSOCIATES", self.styles['SectionHeader']))
            following_table = self.create_followers_following_table(user_data.get('following', []), 'Following')
            following_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('PADDING', (0, 0), (-1, -1), 6),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
            ]))
            story.append(following_table)

            # Add footer to each page
            def add_page_number(canvas, doc):
                canvas.saveState()
                canvas.setFont('Helvetica', 9)
                page_num = canvas.getPageNumber()
                text = f"Page {page_num} | CONFIDENTIAL | Case Reference: IG-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
                canvas.drawString(doc.leftMargin, doc.bottomMargin - 20, text)
                canvas.restoreState()

            # Build PDF
            doc.build(story, onFirstPage=add_page_number, onLaterPages=add_page_number)
            print(f"Successfully generated PDF report: {output_path}")
            
        except Exception as e:
            print(f"Error generating PDF report: {e}")
            raise
        finally:
            try:
                shutil.rmtree(self.temp_dir)
            except Exception as e:
                print(f"Error cleaning up temporary files: {str(e)}")

def main():
    try:
        report_generator = InstagramDataReport()
        username = input("Enter Instagram username to generate report for: ")
        output_dir = "reports"
        os.makedirs(output_dir, exist_ok=True)
        output_path = os.path.join(output_dir, f"instagram_report_{username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf")
        report_generator.generate_report(username, output_path)
    except Exception as e:
        print(f"Error in main: {str(e)}")
    finally:
        if 'report_generator' in locals():
            report_generator.client.close()

if __name__ == "__main__":
    main()