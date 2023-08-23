import { gsap } from "gsap"
import { Mesh } from "three"

export default class Shape {
    constructor({geometry, material, parentMesh, position, speed = 0.001, offsetSpeed = 0, index}) {
        this.mesh = new Mesh(geometry, material)
        this.mesh.position.copy(position)

        parentMesh.add(this.mesh)

        this.speed = speed
        this.offsetSpeed = offsetSpeed
        this.initPosition = position

        //animate with GSAP
    gsap.fromTo(
        this.mesh.scale,
        {x:0, y:0, z:0},
        {x:1, y:1, z:1, duration:2, delay: 0.2 + index * 0.1, ease: 'expo.out'}
      )
  
    }

    render(time) {
        this.mesh.position.y = Math.sin(time * this.speed + this.offsetSpeed) + this.initPosition.y
        this.mesh.rotation.y += 0.01
    }
}