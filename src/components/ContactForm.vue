<script setup lang="ts"></script>

<template>
  <div class="modal" tabindex="-1" id="contact-modal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Contact</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <p>
            Send us an email to
            <a href="mailto:feedback@stoicsource.com"
              >feedback@stoicsource.com</a
            ><br />
            We'd love to hear from you!
          </p>
          <p>
            <small
              >Developers, you can find us at
              <a href="https://github.com/stoicsource" target="_blank"
                >https://github.com/stoicsource</a
              ></small
            >
          </p>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
