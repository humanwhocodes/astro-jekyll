/**
 * @fileoverview Tests for the Processor class.
 */
/*global describe, it*/
/** @typedef {import("../src/astro-jekyll").JekyllCollectionEntry} JekyllCollectionEntry */

//-----------------------------------------------------------------------------
// Requirements
//-----------------------------------------------------------------------------

import { parseJekyllDateTime, formatJekyllPermalink, formatJekyllPost } from "../src/astro-jekyll.js";
import { expect } from "chai";

//-----------------------------------------------------------------------------
// Tests
//-----------------------------------------------------------------------------

describe("parseJekyllDateTime()", () => {

    [
        "foo",
        "234-09-09"
    ].forEach(input => {
        it(`should return undefined for invalid datetime string: "${input}"`, () => {
            expect(parseJekyllDateTime(input)).to.be.undefined;
        });
    })

    it("should add hours automatically when not supplied", () => {
        const input = "2023-01-02";
        const result = parseJekyllDateTime(input);
    
        expect(result).to.be.instanceOf(Date);
        expect(result.getFullYear()).to.equal(2023);
        expect(result.getMonth()).to.equal(0);
        expect(result.getDate()).to.equal(2);
        expect(result.getHours()).to.equal(0);
        expect(result.getMinutes()).to.equal(0);
        expect(result.getSeconds()).to.equal(0);
    });

    it("should ignore extraneous text after the date", () => {
        const input = "2023-01-02 x";
        const result = parseJekyllDateTime(input);
    
        expect(result).to.be.instanceOf(Date);
        expect(result.getFullYear()).to.equal(2023);
        expect(result.getMonth()).to.equal(0);
        expect(result.getDate()).to.equal(2);
        expect(result.getHours()).to.equal(0);
        expect(result.getMinutes()).to.equal(0);
        expect(result.getSeconds()).to.equal(0);
    });

    it("should correctly save hours", () => {
        const input = "2023-01-02 12";
        const result = parseJekyllDateTime(input);
    
        expect(result).to.be.instanceOf(Date);
        expect(result.getFullYear()).to.equal(2023);
        expect(result.getMonth()).to.equal(0);
        expect(result.getDate()).to.equal(2);
        expect(result.getHours()).to.equal(12);
        expect(result.getMinutes()).to.equal(0);
        expect(result.getSeconds()).to.equal(0);
    });

    it("should correctly save hours and minutes", () => {
        const input = "2023-01-02 12:14";
        const result = parseJekyllDateTime(input);
    
        expect(result).to.be.instanceOf(Date);
        expect(result.getFullYear()).to.equal(2023);
        expect(result.getMonth()).to.equal(0);
        expect(result.getDate()).to.equal(2);
        expect(result.getHours()).to.equal(12);
        expect(result.getMinutes()).to.equal(14);
        expect(result.getSeconds()).to.equal(0);
        expect(result.getTimezoneOffset()).to.equal(new Date().getTimezoneOffset());
    });

    it("should correctly save hours, minutes, and seconds", () => {
        const input = "2023-01-02 12:14:45";
        const result = parseJekyllDateTime(input);
    
        expect(result).to.be.instanceOf(Date);
        expect(result.getFullYear()).to.equal(2023);
        expect(result.getMonth()).to.equal(0);
        expect(result.getDate()).to.equal(2);
        expect(result.getHours()).to.equal(12);
        expect(result.getMinutes()).to.equal(14);
        expect(result.getSeconds()).to.equal(45);
        expect(result.getTimezoneOffset()).to.equal(new Date().getTimezoneOffset());
    });

    it("should correctly save hours, minutes, seconds, and UTC time zone", () => {
        const input = "2023-01-02 12:14:45 +0000";
        const result = parseJekyllDateTime(input);
    
        expect(result).to.be.instanceOf(Date);
        expect(result.getFullYear()).to.equal(2023);
        expect(result.getMonth()).to.equal(0);
        expect(result.getDate()).to.equal(2);
        expect(result.getHours()).to.equal(4); // converted 
        expect(result.getUTCHours()).to.equal(12);
        expect(result.getMinutes()).to.equal(14);
        expect(result.getSeconds()).to.equal(45);
    });

    it("should correctly save hours, minutes, seconds, and GMT-5 time zone", () => {
        const input = "2023-01-02 12:14:45 -0500";
        const result = parseJekyllDateTime(input);
    
        expect(result).to.be.instanceOf(Date);
        expect(result.getFullYear()).to.equal(2023);
        expect(result.getMonth()).to.equal(0);
        expect(result.getDate()).to.equal(2);
        expect(result.getHours()).to.equal(9); // converted
        expect(result.getUTCHours()).to.equal(17);
        expect(result.getMinutes()).to.equal(14);
        expect(result.getSeconds()).to.equal(45);
    });

});

describe("formatJekyllPermalink", () => {
    
    /** @type {JekyllCollectionEntry} */
    const simplePost = {
        slug: "foo-bar-baz",
        data: {
            title: "A sample post",
            date: new Date("2023-01-02T12:45:04"),
        }
    };

    [
        ["/blog/:year/:month/:title/", "/blog/2023/01/foo-bar-baz/"],
        ["/blog/:short_year/:i_month/:slug/", "/blog/23/1/foo-bar-baz/"],
        ["/blog/:year/:month/:day/:title/", "/blog/2023/01/02/foo-bar-baz/"],
        ["/blog/:short_year/:i_month/:i_day/:slug/", "/blog/23/1/2/foo-bar-baz/"],
        ["/blog/:hour/:minute/:second/:slug/", "/blog/12/45/04/foo-bar-baz/"],
    ].forEach(([permalink, expected]) => {

        it(`should format "${permalink}" as "${expected}`, () => {
            const result = formatJekyllPermalink(permalink, simplePost);
            expect(result).to.equal(expected);
        });
    });

});

describe("formatJekyllPost", () => {
    
    it("should format Jekyll post with date in filename", () => {
        
        /** @type {JekyllCollectionEntry} */
        const post = {
            slug: "2023-01-02-foo-bar-baz",
            data: {
                title: "A sample post"
            }
        };

        const result = formatJekyllPost()(post);
        expect(result).to.deep.equal({
            slug: "2023/01/foo-bar-baz",
            data: {
                title: "A sample post",
                date: new Date("2023-01-02T00:00"),
                pubDate: new Date("2023-01-02T00:00"),
            }
        });

    });

    it("should format Jekyll post with date in frontmatter", () => {
        
        /** @type {JekyllCollectionEntry} */
        const post = {
            slug: "foo-bar-baz",
            data: {
                title: "A sample post",
                date: "2023-01-02"
            }
        };

        const result = formatJekyllPost()(post);
        expect(result).to.deep.equal({
            slug: "2023/01/foo-bar-baz",
            data: {
                title: "A sample post",
                date: new Date("2023-01-02T00:00"),
                pubDate: new Date("2023-01-02T00:00"),
            }
        });

    });

    it("should format Jekyll post using date in frontmatter to override filename", () => {
        
        /** @type {JekyllCollectionEntry} */
        const post = {
            slug: "2023-12-12-foo-bar-baz",
            data: {
                title: "A sample post",
                date: "2023-01-02"
            }
        };

        const result = formatJekyllPost()(post);
        expect(result).to.deep.equal({
            slug: "2023/01/foo-bar-baz",
            data: {
                title: "A sample post",
                date: new Date("2023-01-02T00:00"),
                pubDate: new Date("2023-01-02T00:00"),
            }
        });

    });

    it("should format Jekyll post using permalink in frontmatter", () => {
        
        /** @type {JekyllCollectionEntry} */
        const post = {
            slug: "2023-12-12-foo-bar-baz",
            data: {
                title: "A sample post",
                permalink: "/blog/foo/bar/baz"
            }
        };
        
        const result = formatJekyllPost()(post);
        expect(result).to.deep.equal({
            slug: "foo/bar/baz",
            data: {
                title: "A sample post",
                permalink: "/blog/foo/bar/baz",
                date: new Date("2023-12-12T00:00"),
                pubDate: new Date("2023-12-12T00:00"),
            }
        });

    });

    it("should format Jekyll post using permalink with trailing slash in frontmatter", () => {
        
        /** @type {JekyllCollectionEntry} */
        const post = {
            slug: "2023-12-12-foo-bar-baz",
            data: {
                title: "A sample post",
                permalink: "/blog/foo/bar/baz/"
            }
        };
        
        const result = formatJekyllPost()(post);
        expect(result).to.deep.equal({
            slug: "foo/bar/baz",
            data: {
                title: "A sample post",
                permalink: "/blog/foo/bar/baz/",
                date: new Date("2023-12-12T00:00"),
                pubDate: new Date("2023-12-12T00:00"),
            }
        });

    });

    it("should format Jekyll post with frontmatter permalink and ignore custom permalink", () => {
        
        /** @type {JekyllCollectionEntry} */
        const post = {
            slug: "2023-12-12-foo-bar-baz",
            data: {
                title: "A sample post",
                permalink: "/blog/foo/bar/baz/"
            }
        };
        
        const result = formatJekyllPost({
            permalink: "/snippets/foo/:year/:month/:title"
        })(post);
        expect(result).to.deep.equal({
            slug: "foo/bar/baz",
            data: {
                title: "A sample post",
                permalink: "/blog/foo/bar/baz/",
                date: new Date("2023-12-12T00:00"),
                pubDate: new Date("2023-12-12T00:00"),
            }
        });

    });

    it("should format Jekyll post using custom permalink", () => {
        
        /** @type {JekyllCollectionEntry} */
        const post = {
            slug: "2023-12-12-foo-bar-baz",
            data: {
                title: "A sample post"
            }
        };
        
        const result = formatJekyllPost({
            permalink: "/snippets/foo/:year/:month/:title"
        })(post);
        expect(result).to.deep.equal({
            slug: "foo/2023/12/foo-bar-baz",
            data: {
                title: "A sample post",
                date: new Date("2023-12-12T00:00"),
                pubDate: new Date("2023-12-12T00:00"),
            }
        });

    });

});
