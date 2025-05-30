import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Jonathan Yombo",
    role: "Software Engineer",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
    quote:
      "Tailus is really extraordinary and very practical, no need to break your head. A real gold mine.",
  },
  {
    name: "Yves Kalume",
    role: "GDE - Android",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
    quote:
      "With no experience in webdesign I just redesigned my entire website in a few minutes with tailwindcss thanks to Tailus.",
  },
  {
    name: "Shekinah Tshiokufila",
    role: "Senior Software Engineer",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
    quote:
      "Tailus is redefining the standard of web design, with these blocks it provides an easy and efficient way for those who love beauty but may lack the time to implement it. I can only recommend this incredible wonder.",
  },
  {
    name: "Yucel Faruksahan",
    role: "Tailkits Creator",
    image: "https://randomuser.me/api/portraits/men/7.jpg",
    quote:
      "Great work on tailfolio template. This is one of the best personal website that I have seen so far :)",
  },
  {
    name: "Anonymous author",
    role: "Doing something",
    image: "https://randomuser.me/api/portraits/men/8.jpg",
    quote:
      "With no experience in webdesign I just redesigned my entire website in a few minutes with tailwindcss thanks to Tailus.",
  },
  {
    name: "Oketa Fred",
    role: "Fullstack Developer",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
    quote:
      "I absolutely love Tailus! The component blocks are beautifully designed and easy to use, which makes creating a great-looking website a breeze.",
  },
];

const chunkArray = (
  array: Testimonial[],
  chunkSize: number
): Testimonial[][] => {
  const result: Testimonial[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
};

const testimonialChunks = chunkArray(
  testimonials,
  Math.ceil(testimonials.length / 3)
);

export default function Testimonial() {
  return (
    <section className="bg-background overflow-hidden border-t border-dashed py-4 lg:py-0  divide-x">
      <div className="p-4 border-b border-dashed ">
        <h2 className="text-3xl font-semibold font-heading tracking-tight">
          Loved by the Community
        </h2>
        <p className="text-muted-foreground">
          Harum quae dolore orrupti aut temporibus ariatur.
        </p>
      </div>
      <div className="p-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {testimonialChunks.map((chunk, chunkIndex) => (
            <div key={chunkIndex} className="space-y-2">
              {chunk.map(({ name, role, quote, image }, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="grid grid-cols-[auto_1fr] gap-4 p-2">
                    <Avatar className="size-10">
                      <AvatarImage
                        alt={name}
                        src={image}
                        loading="lazy"
                        width="120"
                        height="120"
                      />
                      <AvatarFallback>ST</AvatarFallback>
                    </Avatar>

                    <div>
                      <h3 className="font-semibold">{name}</h3>

                      <span className="text-muted-foreground block text-sm">
                        {role}
                      </span>

                      <blockquote className="mt-3">
                        <p className="text-muted-foreground">{quote}</p>
                      </blockquote>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
