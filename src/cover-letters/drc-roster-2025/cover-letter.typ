#import "/src/templates/default/pdf/letter.typ": letter
#let data = yaml("/public/data/cv-data.yaml")
#let content = json("/src/cover-letters/drc-roster-2025/content.json")

#show: doc => letter(
  data: data,
  subject: content.subject,
  recipient: content.recipient,
  doc
)

#for paragraph in content.paragraphs [
  #paragraph
  #v(0.5em)
]
