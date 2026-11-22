// иконки платформ в фирменных цветах (простые SVG-пути)
export const PLATFORM_STYLE: Record<string, { color: string, mark: string }> = {
  twitch: {color: '#9146FF', mark: 'M4 3 3 6v13h4v2h2l2-2h3l5-5V3H4Zm14 10-3 3h-3l-2 2v-2H7V5h11v8Zm-3-6v4h-2V7h2Zm-4 0v4H9V7h2Z'},
  kick: {color: '#53FC18', mark: 'M4 3h5v5h2V6h2V4h2V3h5v6h-2v2h-2v2h2v2h2v6h-5v-1h-2v-2h-2v-2H9v5H4V3Z'},
  vk: {color: '#0077FF', mark: 'M12.8 18C6.6 18 3.1 13.8 3 6.7h3.1c.1 5.2 2.4 7.4 4.2 7.9V6.7h2.9v4.5c1.8-.2 3.7-2.2 4.3-4.5h2.9c-.5 2.8-2.5 4.8-4 5.6 1.5.7 3.8 2.4 4.7 5.7h-3.2c-.7-2.2-2.4-3.9-4.7-4.1V18h-.4Z'},
}

const platforms = [
  {name: 'Twitch', domains: ['twitch.tv'], mark: PLATFORM_STYLE.twitch!.mark},
  {name: 'Kick', domains: ['kick.com'], mark: PLATFORM_STYLE.kick!.mark},
  {name: 'VK', domains: ['vk.com', 'vk.ru', 'vkvideo.ru'], mark: PLATFORM_STYLE.vk!.mark},
  {name: 'YouTube', domains: ['youtube.com', 'youtu.be'], mark: 'M22 7q-.4-2-2.4-2.3Q12 3.8 4.4 4.7 2.4 5 2 7q-.8 5 0 10 .4 2 2.4 2.3 7.6.9 15.2 0Q21.6 19 22 17q.8-5 0-10ZM10 8.5l6 3.5-6 3.5Z'},
  {name: 'Telegram', domains: ['t.me', 'telegram.me'], mark: 'M2 11 21 3q1-.4.8 1L18.6 21l-6.2-4.7-3.1 2.9.6-5.2 8.4-8-10.5 6.9Z'},
]

export function channelPlatform(link?: string | null) {
  if (!link) return null
  try {
    const url = new URL(link)
    if (!['https:', 'http:'].includes(url.protocol)) return null
    const platform = platforms.find(({domains}) =>
      domains.some(domain => url.hostname === domain || url.hostname.endsWith('.' + domain)))
    return {href: url.href, name: platform?.name ?? url.hostname, mark: platform?.mark}
  } catch {
    return null
  }
}
