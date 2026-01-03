# supacoda Website

Personal portfolio website for supacoda - showcasing software development and design work.

## Tech Stack

- ASP.NET Core 9.0 (Razor Pages)
- C# / HTML / CSS / JavaScript
- Localization support (English/German)

## Features

- Interactive particle logo animation on homepage
- Dark/light theme toggle
- Multi-language support (EN/DE)
- Responsive design
- Minimal, performance-focused aesthetic

## Running Locally

```bash
dotnet restore
dotnet run
```

Navigate to `http://localhost:5239`

## Project Structure

```
Pages/          # Razor Pages (Index, Work, About, Contact, Impressum)
Resources/      # Localization resource files (.resx)
wwwroot/        # Static assets (CSS, JS, images)
```

## Localization

The site supports English and German languages. Resource strings are managed in `Resources/SharedResource.*.resx` files. Language toggle button in the navigation switches between locales using cookie-based persistence.

---

Built with intentional simplicity and respect for user attention.
