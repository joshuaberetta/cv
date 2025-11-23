# Creating New Templates

This project supports multiple templates for both the website (React) and PDF (Typst).

## Directory Structure

Templates are located in `src/templates/`. Each template has its own directory with the following structure:

```
src/templates/
  <template-name>/
    web/
      CV.tsx        # Main React component
      main.css      # Styles for the web version
      ...           # Other components
    pdf/
      cv.typ        # Typst file for PDF generation
```

## Creating a New Template

1.  **Create Directory**: Create a new directory in `src/templates/` with your template name (e.g., `modern`).
2.  **Web Template**:
    *   Create `web/CV.tsx`. It must export a default React component that accepts `data` prop of type `CVData`.
    *   Create `web/main.css` (optional but recommended). Import it in `CV.tsx`.
    *   Implement your layout using the data.
3.  **PDF Template**:
    *   Create `pdf/cv.typ`.
    *   Load data using `#let data = yaml("/public/data/cv-data.yaml")`.
    *   Implement your PDF layout using Typst.
4.  **Register Template**:
    *   Open `src/templates/registry.ts`.
    *   Import your new `CV` component.
    *   Add a case to the `getTemplateComponent` switch statement.

## Using a Template

To use a template, update `public/data/cv-data.yaml`:

```yaml
basics:
  template: <template-name>
  ...
```

## Build Process

*   **Web**: The build script `src/build.ts` reads the template name from `cv-data.yaml` and inlines the corresponding CSS file (`src/templates/<template>/web/main.css`) into the HTML.
*   **PDF**: The build script `src/build-pdf.ts` reads the template name and compiles the corresponding Typst file (`src/templates/<template>/pdf/cv.typ`).

## Best Practices & Common Pitfalls

### CSS Scoping (Web)
*   **Scope your styles**: Do not apply styles directly to global tags like `body` or `html` in your template's `main.css`. This can break the layout of other templates or the main app shell.
*   **Use a container class**: Wrap your entire template in a unique container class (e.g., `.my-template-container`) and apply styles to that class or its children.

```css
/* Bad */
body {
  background-color: #f0f0f0;
}

/* Good */
.my-template-container {
  background-color: #f0f0f0;
  min-height: 100vh;
}
```

### Data Handling (Typst)
*   **Check for Arrays**: Typst treats arrays and single values differently. Use `type(variable) == array` to check if a field is a list.
    ```typst
    #let emails = if type(data.basics.email) == array {
      data.basics.email.join(" / ")
    } else {
      data.basics.email
    }
    ```
*   **Optional Fields**: Use `keys().contains("field_name")` to check if a field exists in a dictionary before accessing it.
    ```typst
    #if lang.keys().contains("fluency") [
      #lang.fluency
    ] else if lang.keys().contains("skills") [
      Listening: #lang.skills.listening
    ]
    ```

### Data Handling (React)
*   **Arrays**: Always check if a field is an array before mapping over it, or handle both string and array cases for fields like `email`.
    ```tsx
    {Array.isArray(basics.email) ? (
      basics.email.join(" / ")
    ) : (
      basics.email
    )}
    ```
