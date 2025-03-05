#version 330 compatibility
uniform float uKa, uKd, uKs; // coefficients of each type of lighting
uniform float uShininess; // specular exponent
uniform vec4 uColor;

in vec3 gN; // normal vector
in vec3 gL; // vector from point to light
in vec3 gE; // vector from point to eye

void main( )
{
    vec3 Normal = normalize(gN);
    vec3 Light = normalize(gL);
    vec3 Eye = normalize(gE);
    vec3 myColor = uColor.rgb; // default color
    vec3 mySpecularColor = vec3( 1.0, 1.0, 1.0 ); // specular highlight color
    
    vec3 ambient = uKa * myColor;
    float d = max( dot(Normal,Light), 0. );
    vec3 diffuse = uKd * d * myColor;
    float s = 0.;
    if( d > 0. ) // only do specular if the light can see the point
    {
        vec3 ref = normalize( reflect( -Light, Normal ) );
        float cosphi = dot( Eye, ref );
        if( cosphi > 0. )
        s = pow( cosphi, uShininess );
    }
    vec3 specular = uKs * s * mySpecularColor;
    gl_FragColor = vec4( ambient + diffuse + specular, 1. );
}