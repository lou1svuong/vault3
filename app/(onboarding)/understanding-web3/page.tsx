import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

export default function UnderstandingWeb3Page() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-8">
      <div className="w-full max-w-4xl mx-auto border border-dashed rounded-none bg-background p-8 flex flex-col gap-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading mb-2">
          Understanding Web3
        </h1>
        <p className="text-base text-muted-foreground">
          The internet has been evolving ever since it was created, and it has
          been through many eras.
        </p>
        <div className="flex flex-col gap-4">
          <section>
            <h2 className="text-lg font-semibold mb-1">Web1</h2>
            <p className="text-sm text-muted-foreground">
              Web1 started during the 1990s, and it was a period marked by
              people connecting to the internet and reading what was there, but
              not publishing or contributing themselves.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-1">Web2</h2>
            <p className="text-sm text-muted-foreground">
              Web2 came into being during the early 2000s with the rise of
              social media, faster internet speeds, and mobile devices. Web2 was
              a period marked by user generated content, targeted advertising,
              and corporate owned data.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-1">Web3</h2>
            <p className="text-sm text-muted-foreground">
              Web3 is a new era of the internet that is currently emerging
              thanks to the power of blockchain technology. Web3 is marked by
              user-owned data, open-source software, decentralized platforms,
              property rights, collective action, digital money
              (cryptocurrencies), and interoperability.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Web3 is attempting to solve many of the problems that arose during
              Web1 and Web2, and it will hopefully be yet another step in the
              direction of a digital world that works better for more people.
            </p>
          </section>
        </div>
        {/* Comparison Table */}
        <div className="overflow-x-auto mt-8">
          <table className="min-w-full border border-dashed">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-2 font-semibold border-b border-dashed">
                  Web2
                </th>
                <th className="text-left px-4 py-2 font-semibold border-b border-dashed">
                  Web3
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  Individual accounts for each website
                </td>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  Sign in everywhere with 1 wallet/identity
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  Accounts have usernames and passwords set by the user
                </td>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  Wallets have public addresses and private keys that are
                  deterministic and not set by the user
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  User data is held and controlled by the website owner
                </td>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  More user data is controlled by the user themself
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  No digital ownership or property rights
                </td>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  Digital ownership and property rights
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  Not interoperable
                </td>
                <td className="px-4 py-3 border-b border-dashed align-top">
                  Highly interoperable
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 align-top">
                  Walled gardens, hard to change platforms
                </td>
                <td className="px-4 py-3 align-top">
                  Open gardens, change platforms whenever you like
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            className="w-full rounded-none border-dashed"
            asChild
          >
            <Link href="/">$ cd /home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
