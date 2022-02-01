import React from 'react';

function IndexPage() {
  return (
    <div>
      <section className="section">
        <div className="container">
          <h1 className="title">
            Storyteller
          </h1>
          <p className="subtitle">
            Supercharge your Content
          </p>

          <div className="content">
            <p>Storyteller is a new platform built by the creators of the&nbsp; 
              <a href="https://fakeyou.com">FakeYou deep fake website</a>.</p>

            {/*<p>In the future, everyone will have their own Hollywood studio.
              And that's what we're building.</p>*/}
          </div>
        </div>
      </section>
    </div>
  )
}

export { IndexPage }