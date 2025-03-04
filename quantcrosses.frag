#version 330 compatibility

// you can set these 4 uniform variables dynamically or hardwire them:
uniform float	uKa, uKd, uKs;	// coefficients of each type of lighting
uniform float	uShininess;	// specular exponent

// in Project #1, these have to be set dynamically from glman sliders or keytime animations or by keyboard hits:
uniform float	uAd, uBd;
uniform float	uTol;


// We introduce the noise
uniform float uNoiseFreq, uNoiseAmp;
uniform sampler3D Noise3;



// interpolated from the vertex shader:
in  vec2  vST;    // texture coords
in  vec3  vN;     // normal vector
in  vec3  vL;     // vector from point to light
in  vec3  vE;     // vector from point to eye
in  vec3  vMC;    // model coordinates

const vec3 OBJECTCOLOR   = vec3( 1.0, 1.0, 0.0 );  // example: yellow
const vec3 ELLIPSECOLOR = vec3(0.12, 0.24, 0.7); // example: pink
const vec3 SPECULARCOLOR = vec3( 1., 1., 1. );

void main( )
{
    vec2 st = vST;
    vec3 myColor = OBJECTCOLOR;

    vec4 nv = texture(Noise3, uNoiseFreq*vMC);
    
    float n = nv.r + nv.g + nv.b + nv.a; // range is 1.0 --> 3.
    n = n - 2.;

    n *= uNoiseAmp;

    

    // 1. Figure out which tile we're in:
    int numins = int( st.s / uAd );
    int numint = int( st.t / uBd );

    // 2. Half-width/height of each tile:
    float Ar = 0.5 * uAd;
    float Br = 0.5 * uBd;

    // 3. Center of the current tile:
    float sc = numins * uAd + Ar;
    float tc = numint * uBd + Br;

    float ds = st.s - sc;
    float dt = st.t - tc;

    float oldDist = sqrt(ds*ds + dt*dt);
    float newDist = oldDist + n;
    float scale = newDist / oldDist;


    ds *= scale;
    ds /= Ar;
    dt *= scale;
    dt /= Br;
    float dd = ds*ds + dt*dt;

    // 5. Smoothly blend between ELLIPSECOLOR (inside ellipse) and OBJECTCOLOR (outside):
    float t = smoothstep( 1.0 - uTol, 1.0 + uTol, dd );
    myColor = mix( ELLIPSECOLOR, OBJECTCOLOR, t );

    // ========== Per-fragment lighting calculations: ==========

    vec3 Normal = normalize( vN );
    vec3 Light  = normalize( vL );
    vec3 Eye    = normalize( vE );

    // ambient:
    vec3 ambient = uKa * myColor;

    // diffuse:
    float d = max( dot(Normal, Light), 0.0 );  
    vec3 diffuse = uKd * d * myColor;

    // specular:
    float s = 0.0;
    if( d > 0.0 ) {
        vec3 ref = normalize( reflect( -Light, Normal ) );
        float cosphi = dot( Eye, ref );
        if( cosphi > 0.0 )
            s = pow( cosphi, uShininess );
    }
    vec3 specular = uKs * s * SPECULARCOLOR;

    gl_FragColor = vec4( ambient + diffuse + specular, 1.0 );


}


// src: https://web.engr.oregonstate.edu/~mjb/cs557/Handouts/noise.1pp.pdf