/**
 * @fileoverview Package file
 * @author Nicholas C. Zakas
 */

//-----------------------------------------------------------------------------
// Data
//-----------------------------------------------------------------------------

const DATETIME = /^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{2})(?::(\d{2})(?::(\d{2}))?)?(?:\s*([+-]\d{4}))?)?/

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
 * Formats an Astro post with Jekyll frontmatter data in a way
 * that Astro can understand.
 * @param {Object} post The Astro post object. 
 * @returns {Object} A new post object containing the Jekyll
 *      frontmatter.
 */
export function formatJekyllPost(post) {

    /** @type {string} */
    let slug = post.slug;

    /** @type {Date} */
    let postDate;

    // is there a date in the filename?
    postDate = parseJekyllDateTime(slug);
    if (postDate) {
        slug = slug.slice(11);
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
    if (post.data.permalink) {

        // format: [ '', 'blog', '2009', '05', '05', 'http-cookies-explained', '' ]
        const pathParts = post.data.permalink.split("/");
        pathParts.shift();  // remove first empty space
        pathParts.shift();  // remove "blog"
        pathParts.pop();    // remove last empty space
        slug = pathParts.join("/");
    } else if (postDate) {
        slug = `${postDate.getFullYear()}/${
            (postDate.getMonth() + 1).toString().padStart(2, "0")
        }/${slug}`;
    }

    post.slug = slug;

    return post;
}
