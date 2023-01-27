# Astro Jekyll Compatibility Package

by [Nicholas C. Zakas](https://humanwhocodes.com)

If you find this useful, please consider supporting my work with a [donation](https://humanwhocodes.com/donate).

## Description

Allows [Astro](https://astro.build) to understand Markdown formatted in the manner that [Jekyll](https://jekyllrb.com) to make transitioning from Jekyll to Astro easier.

See the `example-site` folder for an example.

## Requirements

* Node.js v18+
* Astro v2.0+

## Installation

Install using [npm][npm] or [yarn][yarn]:

```
npm install @humanwhocodes/astro-jekyll

# or

yarn add @humanwhocodes/astro-jekyll
```

## Usage

This package exports the following:

* `parseJekyllDateTime()` - a utility function to convert Jekyll-formatted datetime strings into JavaScript `Date` objects.
* `formatJekyllPermalink()` - a utility function to populate a Jekyll permalink string with post information.
* `formatJekyllPost()` - a function that returns a function you can use to format posts using Jekyll frontmatter.

Import into your Astro project:

```js
import {
    parseJekyllDateTime,
    formatJekyllPermalink,
    formatJekyllPost
} from "@humanwhocodes/async-event-emitter";
```

In general, you'll probably only ever need `formatJekyllPost()`, which you use after calling `getCollection()`, like this:

```js
import { CollectionEntry, getCollection } from 'astro:content';	
    
const posts = (await getCollection('blog'))
    .map(formatJekyllPost());
```

Each `CollectionEntry` object is then populated with the Jekyll-style frontmatter and ready to be used elsewhere in Astro.

By default, `formatJekyllPost()` assumes a permalink format of `/blog/:year/:month/:title`. You can change it by passing in a custom permalink format:

```js
import { CollectionEntry, getCollection } from 'astro:content';	
    
const posts = (await getCollection('blog'))
    .map(formatJekyllPost({
        permalink: "/snippets/:short_year/:month/:title/"
    }));
```

The first part of the permalink (in this case, `snippets`) is assumed to be the directory your `[...slug].astro` file is in and will be stripped off. It's only used for proper placement in the string and to make it easy to copy-paste permalinks directly from Jekyll.

The following placeholders are supported:

* `:year`
* `:short_year`
* `:month`
* `:i_month`
* `:day`
* `:i_day`
* `:hour`
* `:minute`
* `:second`
* `:title`
* `:slug`

Pull requests gratefully accepted for adding the remaining Jekyll placeholders.

## License

Apache 2.0
