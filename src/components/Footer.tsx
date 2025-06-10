export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-end gap-4 md:h-16 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-right md:mr-8">
          © {new Date().getFullYear()} AideeResume. All rights reserved. Created by{" "}
          <a
            href="https://github.com/natthaphat"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4"
          >
            Natthaphat Toichatturat
          </a>
        </p>
      </div>
    </footer>
  );
} 