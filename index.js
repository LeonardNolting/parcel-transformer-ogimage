// Taken from https://github.com/lukechilds/parcel-plugin-ogimage

import {Transformer} from '@parcel/plugin'

const getMetaTag = (html, property) => {
	const regex   = new RegExp(`<meta[^>]*property=["|']${property}["|'][^>]*>`, 'i')
	const results = regex.exec(html)
	if (!results) throw new Error(`Missing ${property}`)
	return results[0]
}

const getMetaTagContent = metaTagHtml => {
	const contentRegex = /content="([^"]*)"/i
	const results      = contentRegex.exec(metaTagHtml)
	if (!results) throw new Error(`Missing content attribute in ${metaTagHtml}`)
	return results[1]
}

// noinspection JSUnusedGlobalSymbols
export default new Transformer({
	async transform({asset}) {
		const source = await asset.getCode()

		const ogImageTag     = getMetaTag(source, 'og:image')
		const ogImageContent = getMetaTagContent(ogImageTag)

		const ogUrlTag     = getMetaTag(source, 'og:url')
		const ogUrlContent = getMetaTagContent(ogUrlTag)

		const absoluteOgImageUrl    = new URL(ogImageContent, ogUrlContent).href
		const ogImageTagAbsoluteUrl = ogImageTag.replace(ogImageContent, absoluteOgImageUrl)
		const patchedHtml           = source.replace(ogImageTag, ogImageTagAbsoluteUrl)

		asset.setCode(patchedHtml)

		return [asset]
	}
})
