declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

// Skip SVG declaration since it's already in react-app.d.ts
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp'; 