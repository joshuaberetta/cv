#let data = yaml("/public/data/cv-data.yaml")

#let pride-red = rgb("#E40303")
#let pride-orange = rgb("#FF8C00")
#let pride-yellow = rgb("#FFED00")
#let pride-green = rgb("#008026")
#let pride-blue = rgb("#004DFF")
#let pride-purple = rgb("#750787")

#set page(
  margin: (x: 0cm, y: 0cm),
)

#set text(
  font: "Roboto",
  size: 10pt,
)

// Header
#rect(
  width: 100%,
  height: 5cm,
  fill: gradient.linear(pride-red, pride-orange, pride-yellow, pride-green, pride-blue, pride-purple, angle: 0deg),
)[
  #pad(x: 2cm, y: 1.5cm)[
    #text(fill: white, size: 30pt, weight: "bold")[#data.basics.name] \
    #v(0.2cm)
    #text(fill: white, size: 14pt)[#data.basics.tagline] \
    #v(0.5cm)
    #text(fill: white, size: 9pt)[
      #let emails = if type(data.basics.email) == array {
        data.basics.email.join(" / ")
      } else {
        data.basics.email
      }
      #emails | #data.basics.phone | #data.basics.location | #data.basics.website
    ]
  ]
]

#pad(x: 2cm, y: 1cm)[
  #grid(
    columns: (2fr, 1fr),
    gutter: 1cm,
    [
      // Left Column
      #if data.basics.summary != none [
        #text(fill: pride-purple, size: 14pt, weight: "bold")[About Me]
        #line(length: 100%, stroke: 2pt + pride-purple)
        #v(0.2cm)
        #data.basics.summary
        #v(0.5cm)
      ]

      #text(fill: pride-red, size: 14pt, weight: "bold")[#data.sections.work]
      #line(length: 100%, stroke: 2pt + pride-red)
      #v(0.2cm)
      #for job in data.work [
        #block(
          stroke: (left: 2pt + pride-blue),
          inset: (left: 0.3cm),
          [
            #text(weight: "bold")[#job.position] \
            #text(style: "italic", fill: gray)[#job.company, #job.location] \
            #text(size: 8pt, fill: gray)[#job.startDate - #job.endDate] \
            #if job.keys().contains("description") [
              #v(0.1cm)
              #job.description
            ]
          ]
        )
        #v(0.3cm)
      ]

      #v(0.5cm)
      #text(fill: pride-orange, size: 14pt, weight: "bold")[#data.sections.education]
      #line(length: 100%, stroke: 2pt + pride-orange)
      #v(0.2cm)
      #for edu in data.education [
        #block(
          stroke: (left: 2pt + pride-green),
          inset: (left: 0.3cm),
          [
            #text(weight: "bold")[#edu.institution] \
            #text(style: "italic", fill: gray)[#edu.degree] \
            #text(size: 8pt, fill: gray)[#edu.startDate - #edu.endDate]
          ]
        )
        #v(0.3cm)
      ]
    ],
    [
      // Right Column
      #if data.keys().contains("skills") [
        #text(fill: pride-blue, size: 14pt, weight: "bold")[Skills]
        #line(length: 100%, stroke: 2pt + pride-blue)
        #v(0.2cm)
        #for (i, skill) in data.skills.enumerate() [
          #let color = (pride-red, pride-orange, pride-yellow, pride-green, pride-blue, pride-purple).at(calc.rem(i, 6))
          #box(
            fill: color,
            inset: 5pt,
            radius: 3pt,
            text(fill: if color == pride-yellow { black } else { white })[#skill]
          )
          #h(0.1cm)
        ]
        #v(0.5cm)
      ]

      #text(fill: pride-green, size: 14pt, weight: "bold")[Languages]
      #line(length: 100%, stroke: 2pt + pride-green)
      #v(0.2cm)
      #for lang in data.languages [
        #text(weight: "bold")[#lang.language] \
        #if lang.keys().contains("fluency") [
          #text(style: "italic", fill: gray)[#lang.fluency]
        ] else if lang.keys().contains("skills") [
          #text(style: "italic", fill: gray, size: 8pt)[
            Listening: #lang.skills.listening | Speaking: #lang.skills.spokenInteraction
          ]
        ]
        #v(0.2cm)
      ]
    ]
  )
]
