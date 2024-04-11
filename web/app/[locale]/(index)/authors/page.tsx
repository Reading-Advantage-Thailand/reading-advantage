import React from "react";
import * as Tabs from "@radix-ui/react-tabs";
import authorsFiction from '../../../../data/authors-fiction.js';
import authorsNonFiction from '../../../../data/authors-fiction.js';

type Props = {};

export default function AuthorsPage({}: Props) {
  return (
    <>
 {/* fiction */}
 <section>
        <div style={{ margin: "0 auto", maxWidth: "800px", padding: "20px" }}>
          <h1 className="font-bold text-center mb-4">Authors: Non Fiction</h1>
          {authorsFiction.map((author: any, index: number) => (
            <div key={index} style={{ marginBottom: "40px" }}>
              <h2><span className="font-bold">{author.genre}:</span> {author.author} - {author.description}</h2>
              <p></p>
            </div>
          ))}
        </div>
      </section>
 {/* non fiction */}
 <section>
        <div style={{ margin: "0 auto", maxWidth: "800px", padding: "20px" }}>
          <h1 className="font-bold text-center mb-4">Authors: Non Fiction</h1>
          {authorsNonFiction.map((author: any, index: number) => (
            <div key={index} style={{ marginBottom: "40px" }}>
              <h2><span className="font-bold">{author.genre}:</span> {author.author} - {author.description}</h2>
              <p></p>
            </div>
          ))}
        </div>
      </section>
        
  </>
  );
}
