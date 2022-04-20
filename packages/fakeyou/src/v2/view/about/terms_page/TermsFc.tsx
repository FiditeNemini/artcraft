import React from 'react';

interface Props {
}

function TermsFc(props: Props) {
  return (
    <div className="content is-medium">

      <section className="hero is-small">
        <div className="hero-body">

          <div className="columns is-vcentered">

            <div className="column is-one-third">
              <div className="mascot">
                <img src="/mascot/kitsune_pose1_black_2000.webp" alt="FakeYou Kitsune Mascot!" />
              </div>
            </div>

            <div className="column">
              <p className="title">
                Terms and Conditions
              </p>
              <p className="subtitle">
                Please use this technology responsibly.
              </p>
            </div>

          </div>

        </div>
      </section>

      <h1 className="title is-4">Terms of Use</h1>

      <p>
        We do not condone the use of FakeYou for any type of deception, slur, 
        abuse, or mistreatment of any individual or group. Please report such 
        abuses to our <a href="https://discord.gg/H72KFXm">community staff on Discord</a>. 
        Bad actors will have their access revoked and materials deleted.
      </p>

      <p>
        This is a research technololgy for fun. You may not use FakeYou deepfakes 
        for commercial use.
      </p>

      <p>
        Do not engage in unlawful activity or attempt to impersonate any person,
        company, or other entity. All published usages must be labled as "deep fake".
      </p>

      <p>
        We'll be happy to remove any of the voices featured here for any reason.
      </p>


    </div>
  )
}

export { TermsFc };
