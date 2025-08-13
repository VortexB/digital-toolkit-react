<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Technology 2.1</title>
    <link rel="stylesheet" href="questions.css" />
  </head>
  <body>
      <a href="https://douglas.research.mcgill.ca/"> 
        <img src="../images/douglas-logo.png" alt="Douglas logo">
      </a>
    <h1>Technology 2.1</h1>
    <h2>
      The current version of the innovation is not yet in a robust and
      definitive form.
    </h2>
    <p>
      To change: The current version of the innovation is already in a robust
      and definitive form.
    </p>
    <div class="btn-group">
      <button id="yesBtn">Yes</button>
      <button id="noBtn">No</button>
    </div>

    <div id="yesModal" class="modal">
      <div class="modal-content">
        <span class="close" data-target="yesModal">&times;</span>

        <p>You selected <strong>Yes</strong>. Great!</p>
        <button id="yesContinue">Continue</button>
      </div>
    </div>

    <div id="noModal" class="modal">
      <div class="modal-content">
        <span class="close" data-target="noModal">&times;</span>

        <p>You selected <strong>No</strong>.</p>
        <h4>Recommended actions</h4>
        <ol>
          <li>
            <p class="left-justified">
              Assess the
              <a
                href="https://ised-isde.canada.ca/site/innovation-canada/en/technology-readiness-levels"
                >technology readiness levels</a
              >
            </p>
          </li>
          <li>
            <p class="left-justified">
              Consult the
              <a href="https://doi.org/10.1016/j.invent.2024.100794">
                Intervention Development Guide
              </a>
              (Figure 2) that supports effort to develop digital mental health
              interventions from theoretical inception to an actual
              intervention<br />(Mertens, E. C. A., &amp; Van Gelder, J. L.
              (2025). The DID-guide: A guide to developing digital mental health
              interventions. Internet Interventions, 39, 100794.)
            </p>
          </li>
        </ol>

        <button id="noContinue">Continue</button>
      </div>
    </div>

    <script src="questions.js"></script>
  </body>
</html>
