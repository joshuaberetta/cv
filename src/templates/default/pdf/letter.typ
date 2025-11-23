#let letter(data: none, subject: "", recipient: "", body) = {
  set page(
    paper: "a4",
    margin: (x: 1.5cm, y: 1.5cm),
    numbering: "1",
    header: align(right)[
      #set text(size: 8pt, fill: rgb("#666666"))
      #datetime.today().display("[day] [month repr:long] [year]")
    ]
  )

  set text(
    size: 10pt,
    lang: "en",
    font: "New Computer Modern",
  )

  set par(justify: true, leading: 0.8em)

  let primary-color = rgb("#1a73e8")
  let text-color = rgb("#333333")
  let gray-color = rgb("#666666")
  let link-color = rgb("#0056b3")
  let sidebar-color = rgb("#fafafa")

  show link: set text(fill: link-color)

  show heading.where(level: 1): it => [
    #set text(fill: primary-color, size: 1.8em)
    #it
    #v(-0.3em)
    #line(length: 100%, stroke: 1pt + primary-color)
    #v(0.5em)
  ]

  grid(
    columns: (30%, 70%),
    gutter: 2em,
    
    // Sidebar
    block(
      fill: sidebar-color,
      inset: 1.5em,
      radius: 8pt,
      width: 100%,
      [
      #set par(justify: false)
      #if data.basics.photo != none {
        let photo-path = data.basics.photo
        if photo-path.starts-with("/") {
          photo-path = "/public" + photo-path
        }
        block(radius: 50%, clip: true, image(photo-path, width: 100%))
      }
      
      #v(0.3em)
      
      = Contact
      
      #let icon(name) = {
        if name == "location" { "📍" }
        else if name == "email" { "📧" }
        else if name == "phone" { "📱" }
        else if name == "website" { "🌐" }
        else if name == "linkedin" { "🔗" }
        else if name == "birthdate" { "🎂" }
        else if name == "nationality" { "🌍" }
      }
      
      #grid(
        columns: (auto, 1fr),
        row-gutter: 0.8em,
        column-gutter: 0.5em,
        align: horizon,
        icon("location"), [#data.basics.location],
        icon("email"), [
          #if type(data.basics.email) == array {
            for e in data.basics.email [
              #link("mailto:" + e)[#e] \
            ]
          } else {
            link("mailto:" + data.basics.email)[#data.basics.email]
          }
        ],
        icon("phone"), [
          #if "phoneUrl" in data.basics [
            #link(data.basics.phoneUrl)[#data.basics.phone]
          ] else [
            #data.basics.phone
          ]
        ],
        icon("website"), [#link("https://" + data.basics.website)[#data.basics.website]]
      )
      
      #v(0.3em)
      
      #if "linkedin" in data.basics [
        #grid(
          columns: (auto),
          gutter: 1em,
          link("https://" + data.basics.linkedin)[
            #image("/public/images/linkedin.svg", width: 1.5em)
          ]
        )
      ]
      
      #v(1fr)
      
      #if "latestVersionUrl" in data.basics [
         #block(breakable: false, width: 100%)[
           #align(center)[
             #block(width: 3cm, radius: 8pt, fill: rgb("#FFFFFF"), inset: 4pt, image("/public/images/qr-code-cover-letter.png", width: 100%))
             #link(data.basics.latestVersionUrl + "/#/cover-letters/drc-roster-2025")[Web Version]
             
             #v(1em)
             
             #block(width: 3cm, radius: 8pt, fill: rgb("#FFFFFF"), inset: 4pt, image("/public/images/qr-code.png", width: 100%))
             #link(data.basics.latestVersionUrl)[Latest CV] \
             #text(size: 0.8em)[#data.basics.latestVersionUrl.replace("https://", "")]
           ]
         ]
      ]
    ]),
    
    // Main Content
    [
      = #data.basics.name
      
      #text(style: "italic", fill: gray-color)[#data.basics.tagline]
      
      #v(2em)
      
      == #subject
      
      #v(1em)
      
      Dear #recipient,
      
      #v(1em)
      
      #body
      
      #v(1em)
      
      Thank you for your time and consideration.
      
      #v(1em)
      
      Sincerely,
      
      #v(0.1em)
      
      *#data.basics.name*
    ]
  )
}
