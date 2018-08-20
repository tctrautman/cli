const AsciiTable = require('ascii-table')
const { flags } = require('@oclif/command')
const Command = require('../../../base')
const { getAddons } = require('../../../utils/api/addons')

class AddonsListCommand extends Command {
  async run() {
    const { flags } = this.parse(AddonsListCommand)
    await this.authenticate()

    const accessToken = this.global.get('accessToken')

    if (!accessToken) {
      this.error(`Not logged in`)
    }

    const siteId = this.site.get('siteId')

    if (!siteId) {
      console.log('No site id found, please run inside a site folder or `netlify link`')
      return false
    }

    const site = await this.netlify.getSite({ siteId })

    const addons = await getAddons(siteId, accessToken)
    if (!addons || !addons.length) {
      console.log(`No addons currently installed for ${site.name}`)
      console.log(`> Run \`netlify addons:create addon-namespace\` to install an addon`)
      return false
    }

    // Json response for piping commands
    if (flags.json) {
      console.log(JSON.stringify(addons, null, 2))
      return false
    }

    const addonData = addons.map(addon => {
      return {
        name: addon.service_name,
        id: addon.id,
      }
    })

    // Build a table out of addons
    console.log(`site: ${site.name}`)
    const table = new AsciiTable(`Currently Installed addons`)

    table.setHeading('Name', 'Instance Id')

    addonData.forEach(s => {
      table.addRow(s.name, s.id)
    })
    // Log da addons
    console.log(table.toString())
  }
}

AddonsListCommand.description = `list current site addons
...
Addons are a way to extend the functionality of your Netlify site
`

AddonsListCommand.flags = {
  json: flags.boolean()
}

module.exports = AddonsListCommand