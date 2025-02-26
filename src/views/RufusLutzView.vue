<template>
  <div class="container-fluid mt-2 position-relative">
    <div class="position-absolute top-0 end-0 me-2">
      <a @click="$router.go(-1)">
        <i class="fa-solid fa-xmark fa-2xl text-secondary"></i>
      </a>
    </div>

    <h1>The Roman Socrates</h1>
    <p>
      published in 1947, translated by Cora Elizabeth Lutz.
    </p>
    <p>
      This edition can currently not be shown on StoicSource, as it is not in the public domain in the European Union (where StoicSource is being hosted).
    </p>
    <p>
      Readers based in the US and other countries can find the text <a href="https://archive.org/details/MUSONIUSRUFUSSTOICFRAGMENTS" target="_blank">here</a>.
    </p>
    <p>
      Background: In the EU, copyright protection lasts for the life of the author plus 70 years. Given that Lutz died in 1985, her works remain under copyright in the EU until December 31, 2055.<br>
      In the U.S., works published between 1924 and 1977 were initially granted a 28-year copyright term, with the possibility of renewal for an additional 67 years. As the copyright was not renewed, the work entered the public domain in 1975.
    </p>
  </div>
</template>

<style scoped>
h1 {
  font-size: 1.1em;
}
</style>
