<script>
import Object3D from '../Object3D'

export default {
  name: 'oimo-body',
  mixins: [Object3D],
  inject: ['world'],
  props: { options: Object },

  data () {
    return { body: null }
  },

  mounted () {
    let opts = {}
    Object.assign(opts, this.options)

    let body = this.world.add(opts)
    body.connectMesh(this.curObj)
    this.body = body

    // If you want to wait until the entire view has been rendered
    // https://vuejs.org/v2/api/#mounted
    this.$nextTick(() => {
      this.dispatchEvent('vm-oimo-body', body)
    })
  },

  beforeDestroy () {
    this.body.dispose()
    this.dispatchEvent('vm-oimo-body', null)
  }
}
</script>
