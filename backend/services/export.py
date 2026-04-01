import json, io, csv
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer

def export_csv(candidates: list) -> bytes:
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Rank","Name","Score","Recommendation","Stage","Experience","Education",
                     "Current Role","Location","Email","Phone","Matched Skills","Missing Skills","Summary"])
    for i, c in enumerate(candidates, 1):
        matched = ", ".join(json.loads(c.matched_skills or "[]"))
        missing = ", ".join(json.loads(c.missing_skills or "[]"))
        writer.writerow([i, c.name, c.score, c.recommendation, c.stage, c.experience,
                         c.education, getattr(c,'current_role',''), getattr(c,'location',''),
                         getattr(c,'email',''), getattr(c,'phone',''),
                         matched, missing, c.summary])
    return output.getvalue().encode("utf-8")

def export_pdf(session_title: str, job_description: str, candidates: list) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story = []
    title_style = ParagraphStyle('T', fontSize=18, fontName='Helvetica-Bold', spaceAfter=6, textColor=colors.HexColor('#111111'))
    story.append(Paragraph(f"Resume Screening Report", title_style))
    story.append(Paragraph(f"<font size=12 color='#555555'>{session_title}</font>", styles['Normal']))
    story.append(Spacer(1, 0.4*cm))
    jd_style = ParagraphStyle('JD', fontSize=9, textColor=colors.HexColor('#444444'), backColor=colors.HexColor('#F5F5F5'), borderPadding=6, spaceAfter=12)
    story.append(Paragraph(f"<b>Job Description:</b> {(job_description[:400]+'...' if len(job_description)>400 else job_description)}", jd_style))
    story.append(Spacer(1, 0.3*cm))
    table_data = [["#","Candidate","Score","Recommendation","Stage","Experience"]]
    for i, c in enumerate(candidates, 1):
        table_data.append([str(i), c.name or c.filename, f"{int(c.score)}/100", c.recommendation or "—", c.stage or "new", c.experience or "—"])
    t = Table(table_data, colWidths=[0.8*cm,4.5*cm,2*cm,3*cm,2*cm,2.7*cm], repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND',(0,0),(-1,0),colors.HexColor('#1a1a1a')),('TEXTCOLOR',(0,0),(-1,0),colors.white),
        ('FONTNAME',(0,0),(-1,0),'Helvetica-Bold'),('FONTSIZE',(0,0),(-1,-1),9),
        ('ROWBACKGROUNDS',(0,1),(-1,-1),[colors.white,colors.HexColor('#FAFAFA')]),
        ('GRID',(0,0),(-1,-1),0.5,colors.HexColor('#DDDDDD')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('PADDING',(0,0),(-1,-1),6),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.6*cm))
    for i, c in enumerate(candidates, 1):
        story.append(Paragraph(f"<b>#{i} — {c.name or c.filename}</b>",
            ParagraphStyle('CN', fontSize=11, fontName='Helvetica-Bold', spaceAfter=3)))
        matched = ", ".join(json.loads(c.matched_skills or "[]"))
        story.append(Paragraph(f"Score: <b>{int(c.score)}/100</b> | {c.recommendation} | {c.experience or '—'} | Stage: {c.stage or 'new'}",
            ParagraphStyle('M', fontSize=9, textColor=colors.HexColor('#555555'), spaceAfter=3)))
        if matched:
            story.append(Paragraph(f"<b>Matched skills:</b> {matched}", ParagraphStyle('S', fontSize=9, spaceAfter=3)))
        if c.recruiter_notes:
            story.append(Paragraph(f"<b>Recruiter notes:</b> {c.recruiter_notes}", ParagraphStyle('N', fontSize=9, spaceAfter=3)))
        story.append(Paragraph(c.summary or "", ParagraphStyle('Sum', fontSize=9, textColor=colors.HexColor('#333333'), spaceAfter=10, leading=14)))
    doc.build(story)
    buffer.seek(0)
    return buffer.read()
