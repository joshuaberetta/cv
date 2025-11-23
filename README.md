# Modern CV Generator

A TypeScript & React-based CV generator that creates a responsive, printable HTML resume from YAML or JSON data.

## Features

- **Data-Driven**: Keep your CV content in structured YAML or JSON files
- **Modern Stack**: Built with TypeScript, React, and Vite
- **Responsive Design**: Looks great on any device
- **Print-Ready**: Optimized for PDF generation when printing
- **Component-Based**: Built with reusable React components
- **Type-Safe**: Full TypeScript support for data models and components

## Setup

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

## Usage

### Development Mode

Start a development server with hot-reloading:

```bash
npm run dev
```

This will start a development server at http://localhost:3000 showing your CV.

### Building Static HTML

To generate a static HTML file (best for GitHub Pages hosting):

```bash
npm run start
```

This will create a `dist/index.html` file that contains everything needed to display your CV.

### Building for Production

To build a production version with Vite:

```bash
npm run build
```

This creates optimized files in the `dist` directory.

## Customizing Your CV

### Edit Your Data

Update your personal information in either:

- `data/cv-data.yaml` (YAML format, more readable)
- `data/cv-data.json` (JSON format, better tooling support)

The generator will automatically choose one of these files (YAML is preferred if both exist).

### Add Your Photo

To use your own photo instead of the generated avatar:
- Add a `photo` field to your CV data with a URL to your image
- Or replace the default avatar URL in `Sidebar.tsx`

### Customize Styling

The main styles are in `src/styles/main.css`. You can modify:

- Colors (change CSS variables at the top)
- Fonts
- Layout
- Print options

## Deployment

### GitHub Pages

For hosting on GitHub Pages:

1. Build your static CV:
   ```bash
   npm run start
   ```

2. Push the `dist` directory to your GitHub Pages repository.

### Other Hosting

Any static site hosting will work:

- Netlify
- Vercel
- Firebase Hosting
- Amazon S3
- etc.

## Project Structure

```
├── data/                  # CV data files
│   ├── cv-data.json       # JSON version
│   └── cv-data.yaml       # YAML version (preferred)
├── public/                # Static assets
├── src/                   # Source code
│   ├── components/        # React components
│   ├── styles/            # CSS styles
│   ├── types/             # TypeScript type definitions
│   ├── build.ts           # Static HTML generator script
│   └── index.tsx          # Main entry point
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies and scripts
```

## License

MIT
