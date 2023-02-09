/**
 * @fileoverview Package file
 * @author Nicholas C. Zakas
 */

/** @typedef {import("./astro-jekyll").JekyllCollectionEntry} JekyllCollectionEntry */

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

const DATETIME = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2})(?::(\d{2})(?::(\d{2}))?)?(?:\s*([+-]\d{4}))?)?/;

/**
 * Parses a Jekyll-formatted datetime into a JavaScipt Date object.
 * If there is no time specified, then the returned Date object is set
 * to midnight so it respects the local timezone settings.
 * Format: YYYY-MM-DD HH:MM:SS +/-TTTT
 * @param {string} text The Jekyll datetime to parse. 
 * @returns {Date|undefined} A date object representing the Jekyll datetime
 *      or undefined if the text isn't a datetime string.
 */
export function parseJekyllDateTime(text) {
    const match = DATETIME.exec(text);
    
    if (!match) {
        return undefined;
    }

    // remove the overall match
    match.shift();

    let dateString = `${match.shift()}-${match.shift()}-${match.shift()}T`;
    if (match[0]) {

        // hours
        dateString += match.shift();

        // minutes
        if (match[0]) {
            dateString += `:${match.shift()}`;
        } else {
            dateString += ":00";  // Date object requires minutes
        }
        
        // seconds
        if (match[0]) {
            dateString += `:${match.shift()}`;
        }

        // timezone offset
        if (match[0]) {
            dateString += `${match.shift()}`;
        }

    } else {
        dateString += "00:00";
    }

    return new Date(dateString);
}

/**
 * 
 * @param {string} permalink The Jekyll permalink format to fill. 
 * @param {JekyllCollectionEntry} post The post containing the data to insert into the permalink.
 * @returns {string} The formatted permalink.
 */
export function formatJekyllPermalink(permalink, post) {

    const { date } = post.data;
    let result = permalink;

    /** @type {Array<[RegExp, string]>} */
    const replacements = [
        [/:year/g, date.getFullYear().toString()],
        [/:short_year/g, date.getFullYear().toString().slice(2, 4)],
        [/:month/g, (date.getMonth() + 1).toString().padStart(2, "0")],
        [/:i_month/g, (date.getMonth() + 1).toString()],
        // [/:short_month/g, (date.getMonth() + 1)],
        // [/:long_month/g, (date.getMonth() + 1)],
        [/:day/g, date.getDate().toString().padStart(2, "0")],
        [/:i_day/g, date.getDate().toString()],
        // [/:y_day/g, date.getDate()],
        // [/:week_year/g, date.getDate()],
        // [/:w_day/g, date.getDate()],
        // [/:short_day/g, date.getDate()],
        // [/:long_day/g, date.getDate()],
        [/:hour/g, date.getHours().toString().padStart(2, "0")],
        [/:minute/g, date.getMinutes().toString().padStart(2, "0")],
        [/:second/g, date.getSeconds().toString().padStart(2, "0")],
        [/:title/g, post.slug],
        [/:slug/g, post.slug],
    ];

    replacements.forEach(([pattern, value]) => {
        result = result.replace(pattern, value);
    });

    return result;
}

/**
 * Formats an Astro post with Jekyll frontmatter data in a way
 * that Astro can understand.
 * @param {Object} options Options for formatting.
 * @param {string} [options.permalink] The permalink format to use. 
 * @returns {Object} A new post object containing the Jekyll
 *      frontmatter.
 */
export function formatJekyllPost({
    permalink = "/blog/:year/:month/:title/"
} = {}) {

    /**
     * Formats the post respecting Jekyll frontmatter.
     * @param {JekyllCollectionEntry} post The post to format.
     * @returns {JekyllCollectionEntry} The formatted post.
     */
    return post => {

        /** @type {string} */
        let slug = post.slug;

        /** @type {Date} */
        let postDate;

        // is there a date in the filename?
        postDate = parseJekyllDateTime(slug);
        if (postDate) {
            slug = slug.slice(11);
            post.slug = slug;
        }

        // date in the data overrides the filename
        if (post.data.date) {
            postDate = (typeof post.data.date === "string")
                ? parseJekyllDateTime(post.data.date)
                : post.data.date;
        }

        // assign the date to the post
        post.data.date = postDate;
        post.data.pubDate = postDate;

        // if there's a permalink we should use that instead
        let url = post.data.permalink ?? formatJekyllPermalink(permalink, post);

        if (!url.startsWith("/")) {
            url = "/" + url;
        }

        // format: [ '', 'blog', '2009', '05', '05', 'http-cookies-explained', '' ]
        const urlParts = url.split("/");
        urlParts.shift();    // remove first empty space
        urlParts.shift();  // remove "blog"

        if (url.endsWith("/")) {
            urlParts.pop();    // remove last empty space
        }

        slug = urlParts.join("/");
        
        // assign final slug for rendering
        post.slug = slug;

        return post;
    };
}
