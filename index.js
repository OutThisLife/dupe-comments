const cx = '004316228581969358434:lfkto9a0k0i';
const key = 'AIzaSyDhxDDgmWgNoN9o3gqS75RpebU2ebMXMg8';
const esc = encodeURIComponent
const { hostname } = location

const buildQuery = obj => Object.keys(obj).map(k => `${esc(k)}=${esc(obj[k])}`).join('&')
const getUserIP = async () => await (await fetch('//api.ipify.org?format=json')).json()

const query = async ({ q, quotaUser }) => {
  const cache = localStorage.getItem(`sh-${q}`)
  const search = `"${q}" site:${hostname}`

  if (!cache) {
    try {
      const response = await fetch(`//www.googleapis.com/customsearch/v1?${buildQuery({
        cx, key,
        quotaUser,
        q: `"${q}" site:${hostname}`,
      })}`)

      if (response.status === 200) {
        const json = await response.json()
        localStorage.setItem(`sh-${q}`, JSON.stringify(json))
        return json
      } else {
        throw response
      }
    } catch (e) {
      return {
        searchInformation: {
          totalResults: 0
        }
      }
    }
  } else {
    return JSON.parse(cache)
  }
}

;(function() {
  let comments = []

  switch (location.hostname) {
    case 'www.reddit.com':
      comments = document.querySelector('.commentarea').getElementsByClassName('usertext-body')
      break

    case '4chan.org':
      comments = document.getElementsByClassName('postMessage')
      break

    case 'stackoverflow.com':
    case /.*?\.stackexchange.com/:
      comments = document.getElementsByClassName('post-text')
      break

    default:
      comments = document.getElementsByClassName('comment')
  }

  getUserIP().then(({ ip }) => {
    ;[].slice.call(comments).map(el => {
      const $parent = el.parentElement
      const q = el.innerText.replace(/\n/gm, '').trim()

      query({
        q,
        quotaUser: ip
      }).then(({ searchInformation: { totalResults }}) => {
        if (parseInt(totalResults, 10) !== 0) {
          $parent.dataset.shill = totalResults
          $parent.style.border = '2px solid #red'
        }
      })
    })
  })
})()
