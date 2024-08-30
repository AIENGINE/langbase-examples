import { OpenAIStream, StreamingTextResponse } from 'ai'

export const runtime = 'edge'

/**
 * Stream AI Chat Messages from Langbase
 *
 * @param req
 * @returns
 */

// const decoder = new TextDecoder();
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, threadId } = body
    // console.log('Request body:', JSON.stringify(body, null, 2))

    // Append the route object to the request body
    // const modifiedBody = {
    //   ...body,
    //   route: "frontend"
    // }
    // console.log('Modified request body:', JSON.stringify(modifiedBody, null, 2))

    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8787';

    const response = await fetch(`${backendUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'lb-thread-id': threadId || ''
      },
      body: JSON.stringify({ messages: messages })
    })

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      const errorText = await response.text()
      throw new Error(`Error ${response.status}: ${errorText}`)
    }

    // Create a transform stream to log and decode response chunks
    // const logStream = new TransformStream({
    //   transform(chunk, controller) {
    //     const decodedChunk = decoder.decode(chunk);
    //     console.log('Decoded response chunk:', decodedChunk);
    //     controller.enqueue(chunk)
    //   }
    // })

    // Pipe the response through the log stream
    // const loggedResponse = response.body?.pipeThrough(logStream)

    // Create a stream from the logged response
    // const stream = OpenAIStream(new Response(loggedResponse, response))
    
    const stream = OpenAIStream(response)
    // Return a streaming response
    return new StreamingTextResponse(stream, {
      headers: {
        'lb-thread-id': response.headers.get('lb-thread-id') || ''
      }
    })


  } catch (error: any) {
    console.error('Uncaught API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500
    })
  }
}
