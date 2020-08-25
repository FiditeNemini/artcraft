// This is taken from Microsoft's MIT-licensed k4a libraries.
// From the file `tools/k4aviewer/graphics/shaders/k4apointcloudshaders.h`
#version 430

in vec4 vertexColor;
out vec4 fragmentColor;

in vec2 texCoord;
uniform bool enableShading;

uniform sampler2D objTexture; // C++ method
//layout(location=2, rgba32f) readonly uniform image2D objTexture; // k4a method

void main()
{
    if (vertexColor.a == 0.0f)
    {
        discard;
    }

    //fragmentColor = vec4(texCoord.r, texCoord.g, 127, 255);
    //fragmentColor = texture2D(objTexture, texCoord); // * 0.80 + color * 0.20;
    //fragmentColor = 0.5 * texture2D(objTexture, texCoord) + 0.01 * vec4(texCoord.r, texCoord.g, 0, 255);
    //vec2 coord = vec2(texCoord.g, texCoord.g);
    vec2 coord = texCoord;
    fragmentColor = texture2D(objTexture, coord);
    //fragmentColor = vertexColor;

    if (fragmentColor.a == 0.0f) {
        discard;
    }
}
