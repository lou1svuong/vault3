"use client";

import Link from "next/link";
import { Terminal, Book, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const docs = [
  {
    title: "Getting Started",
    description: "Learn how to set up and use the password vault",
    link: "/docs/getting-started",
  },
  {
    title: "Security",
    description: "Understand how your passwords are encrypted and stored",
    link: "/docs/security",
  },
  {
    title: "API Reference",
    description: "Detailed documentation of the Tusky SDK",
    link: "/docs/api",
  },
  {
    title: "Best Practices",
    description: "Tips and best practices for password management",
    link: "/docs/best-practices",
  },
];

export default function DocsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full border-dashed border-2 rounded-none shadow-none">
        <CardHeader className="border-b border-dashed pb-4">
          <div className="flex items-center space-x-2">
            <Terminal className="h-5 w-5" />
            <span className="text-sm font-mono">docs.sh</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6 font-mono">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">$</span>
              <span>list_docs</span>
            </div>

            <div className="grid gap-4 pl-6">
              {docs.map((doc, index) => (
                <Link
                  key={index}
                  href={doc.link}
                  className="group cursor-not-allowed"
                >
                  <Card className="border-dashed border-2 rounded-none shadow-none transition-colors hover:bg-accent">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Book className="h-4 w-4 text-muted-foreground" />
                            <h3 className="font-semibold">{doc.title}</h3>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">$</span>
              <div className="flex items-center">
                <span>select_doc</span>
                <span className="ml-1 h-5 w-2 animate-pulse bg-foreground inline-block" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
