import {shallowRef} from 'vue'
import {avatarOf, type Streamer} from '../types/streamer.ts'

export const streamers: Streamer[] = [
    {nickname: 'alinarin', avatar: avatarOf('alinarin'), twitchLink: 'https://twitch.tv/alinarinrin'},
    {nickname: 'archiedos', avatar: avatarOf('archiedos'), twitchLink: 'https://twitch.tv/archiedos'},
    {nickname: 'arrowwoods', avatar: avatarOf('arrowwoods'), twitchLink: 'https://twitch.tv/arrowwoods'},
    {nickname: 'arthas', avatar: avatarOf('arthas'), twitchLink: 'https://www.youtube.com/channel/UCnUrTv9B_WhHLGV6Bjyrj6A'},
    {nickname: 'bratishkinoff', avatar: avatarOf('bratishkinoff'), twitchLink: 'https://twitch.tv/bratishkinoff'},
    {nickname: 'buster', avatar: avatarOf('buster'), twitchLink: 'https://twitch.tv/buster'},
    {nickname: 'dedbaldesh', avatar: avatarOf('dedbaldesh'), twitchLink: 'https://twitch.tv/dedbaldesh'},
    {nickname: 'dunduk', avatar: avatarOf('dunduk'), twitchLink: 'https://twitch.tv/dunduk'},
    {nickname: 'gilticus', avatar: avatarOf('gilticus'), twitchLink: 'https://twitch.tv/gilticus'},
    {nickname: 'gladiatorpwnz', avatar: avatarOf('gladiatorpwnz'), twitchLink: 'https://kick.com/gladvalakaspwnz'},
    {nickname: 'guit88man', avatar: avatarOf('guit88man'), twitchLink: 'https://twitch.tv/guit88man'},
    {nickname: 'itpedia', avatar: avatarOf('itpedia'), twitchLink: 'https://www.twitch.tv/jolygolf'},
    {nickname: 'khovansky', avatar: avatarOf('khovansky'), twitchLink: 'https://kick.com/khovanskytoday'},
    {nickname: 'kuplinovplay', avatar: avatarOf('kuplinovplay'), twitchLink: 'https://twitch.tv/kuplinovplay'},
    {nickname: 'lasqa', avatar: avatarOf('lasqa'), twitchLink: 'https://twitch.tv/lasqa'},
    {nickname: 'lyasyaa', avatar: avatarOf('lyasyaa'), twitchLink: 'https://twitch.tv/lyasyaa'},
    {nickname: 'maddyson', avatar: avatarOf('maddyson'), twitchLink: 'https://twitch.tv/honeymad'},
    {nickname: 'melharucos', avatar: avatarOf('melharucos'), twitchLink: 'https://twitch.tv/melharucos'},
    {nickname: 'nenormova', avatar: avatarOf('nenormova'), twitchLink: 'https://twitch.tv/nenormova'},
    {nickname: 'praden', avatar: avatarOf('praden'), twitchLink: 'https://twitch.tv/praden'},
    {nickname: 'segall', avatar: avatarOf('segall'), twitchLink: 'https://twitch.tv/segall'},
    {nickname: 'serega-pirat', avatar: avatarOf('serega-pirat'), twitchLink: 'https://kick.com/serega_pirat15'},
    {nickname: 'vanomas', avatar: avatarOf('vanomas'), twitchLink: 'https://kick.com/thevanomas'},
    {nickname: 'voodoosh', avatar: avatarOf('voodoosh'), twitchLink: 'https://twitch.tv/voodoosh'},
    {nickname: 'welovegames', avatar: avatarOf('welovegames'), twitchLink: 'https://twitch.tv/welovegames'},
    {nickname: 'uzya', avatar: avatarOf('uzya'), twitchLink: 'https://twitch.tv/uzya'},
    {nickname: 'zhmil', avatar: avatarOf('zhmil'), twitchLink: 'https://www.youtube.com/channel/UCmSImlPUez2i1wvsctTB0Gw'}
]

/** Fisher–Yates: равномерное перемешивание, исходный массив не мутируется. */
function shuffle<T>(items: readonly T[]): T[] {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
}

/**
 * Логика карусели. Хук ничего не запускает сам: компонент вызывает shuffleStreamers() в своём onMounted.
 * До вызова список пустой, поэтому порядок не «перескакивает» после первого рендера.
 */
export function useStreamerCarousel(source: readonly Streamer[] = streamers) {
    const shuffled = shallowRef<Streamer[]>([])

    function shuffleStreamers() {
        shuffled.value = shuffle(source)
    }

    return {streamers: shuffled, shuffleStreamers}
}