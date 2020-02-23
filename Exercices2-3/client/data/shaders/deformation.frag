precision mediump float;

/* Rendu du jeu */
uniform sampler2D uSampler;

/* Texture de déformation en rouge et vert */
uniform sampler2D uDeformation;

/* Texture pour contrôler l'intensité de la déformation */
uniform sampler2D uIntensity;

/* Interval de temps multiplié par la vitesse depuis l'activation du composant */
uniform float uTime;

/* Échelle de la déformation */
uniform float uScale;

/* Coordonnées UV du fragment */
varying vec2 vTextureCoord;

void main(void) {
    vec4 intensityTex = texture2D(uIntensity, vec2(uTime, 0.5));
    vec4 intensity = intensityTex * uScale;

    vec4 deformationTex = texture2D(uDeformation, vTextureCoord + sin(uTime));
    vec4 deformation = (deformationTex - 0.5) * 2.0 * intensity ;

    gl_FragColor = texture2D(uSampler, vTextureCoord + deformation.xy) ;
}

