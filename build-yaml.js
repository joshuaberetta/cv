const fs = require('fs');
const yaml = require('js-yaml');
const path = require('path');

// Read YAML data and HTML template
try {
  const cvData = yaml.load(fs.readFileSync('cv-data.yaml', 'utf8'));
  let template = fs.readFileSync('cv-template.html', 'utf8');

  // Process the template with the data
  function processTemplate(template, data) {
    // Replace simple placeholders
    template = template.replace(/\{\{name\}\}/g, data.basics.name);
    template = template.replace(/\{\{tagline\}\}/g, data.basics.tagline);
    template = template.replace(/\{\{location\}\}/g, data.basics.location);
    template = template.replace(/\{\{email\}\}/g, data.basics.email);
    template = template.replace(/\{\{phone\}\}/g, data.basics.phone);
    template = template.replace(/\{\{website\}\}/g, data.basics.website);
    template = template.replace(/\{\{birthdate\}\}/g, data.basics.birthdate);
    template = template.replace(/\{\{nationality\}\}/g, data.basics.nationality);

    // Process languages section
    let languagesHtml = '';
    data.languages.forEach(lang => {
      let langHtml = `<div class="language-item">
                        <div class="language-name">${lang.language}</div>`;
      
      if (lang.fluency) {
        langHtml += `<div class="language-level-note">${lang.fluency}</div>`;
      } else if (lang.skills) {
        langHtml += `<div class="language-level">
                      <div class="language-skill">
                        <div class="skill-label">Listening</div>
                        <div>${lang.skills.listening}</div>
                      </div>
                      <div class="language-skill">
                        <div class="skill-label">Reading</div>
                        <div>${lang.skills.reading}</div>
                      </div>
                      <div class="language-skill">
                        <div class="skill-label">Writing</div>
                        <div>${lang.skills.writing}</div>
                      </div>
                    </div>
                    <div class="language-level">
                      <div class="language-skill">
                        <div class="skill-label">Spoken Production</div>
                        <div>${lang.skills.spokenProduction}</div>
                      </div>
                      <div class="language-skill">
                        <div class="skill-label">Spoken Interaction</div>
                        <div>${lang.skills.spokenInteraction}</div>
                      </div>
                    </div>
                    <div class="language-level-note">Levels: A1/A2: Basic user; B1/B2: Independent user; C1/C2: Proficient user</div>`;
      }
      
      langHtml += `</div>`;
      languagesHtml += langHtml;
    });
    
    // Replace languages section
    template = template.replace(/\{\{#languages\}\}[\s\S]*?\{\{\/languages\}\}/g, languagesHtml);

    // Process work experience section
    let workHtml = '';
    data.work.forEach(job => {
      workHtml += `<div class="experience-item">
                    <div class="item-header">
                      <div class="item-title">${job.position}</div>
                      <div class="item-date">${job.startDate} – ${job.endDate}</div>
                    </div>
                    <div class="item-subtitle">${job.company} (${job.location})</div>
                  </div>`;
    });
    
    // Replace work section
    template = template.replace(/\{\{#work\}\}[\s\S]*?\{\{\/work\}\}/g, workHtml);

    // Process education section
    let educationHtml = '';
    data.education.forEach(edu => {
      educationHtml += `<div class="education-item">
                        <div class="item-header">
                          <div class="item-title">${edu.degree}</div>
                          <div class="item-date">${edu.startDate} – ${edu.endDate}</div>
                        </div>
                        <div class="item-subtitle">${edu.institution} (${edu.location})</div>
                        <div>
                          <a href="${edu.website}" target="_blank">${edu.website}</a>
                        </div>
                        <div>Level in EQF: ${edu.level}</div>
                      </div>`;
    });
    
    // Replace education section
    template = template.replace(/\{\{#education\}\}[\s\S]*?\{\{\/education\}\}/g, educationHtml);

    return template;
  }

  // Generate the output HTML
  const outputHtml = processTemplate(template, cvData);

  // Write the output to index.html
  fs.writeFileSync('index.html', outputHtml);

  console.log('CV website generated successfully! Open index.html to view it.');
} catch (e) {
  console.error('Error:', e);
}
