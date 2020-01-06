<template>
    <v-dialog
        v-model="dialog"
        fullscreen
        hide-overlay
        transition="dialog-bottom-transition"
    >
        <v-card style="min-height: 100%;">
            <v-toolbar dark color="primary">
                <v-btn icon dark @click="closeImageSelect">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
                <v-toolbar-title>Images</v-toolbar-title>
                <v-spacer></v-spacer>
            </v-toolbar>
            <v-container grid-list-sm fluid>
                <v-layout row wrap>
                    <v-flex
                        xs12
                        v-if="objectImages.length"
                    >
                        <h2
                            class="display-1 mb-3 mt-3"
                        >
                            Associated Images
                        </h2>
                        <v-card>
                            <v-card-text class="pa-3">
                                <v-layout wrap>
                                    <v-flex
                                        v-for="(image, index) in objectImages"
                                        :key="index"
                                        xs12 sm4 md3
                                        class="d-flex child-flex"
                                    >
                                        <v-card flat tile>
                                            <v-img
                                                @click="selectImage(image)"
                                                :src="'/images/' + image.hash + '-ft=320+320.' + image.type"
                                                :lazy-src="'/images/' + image.hash + '-ft=320+320.' + image.type"
                                                aspect-ratio="1"
                                                class="grey lighten-2"
                                            >
                                                <template v-slot:placeholder>
                                                    <v-row
                                                        class="fill-height ma-0"
                                                        align="center"
                                                        justify="center"
                                                    >
                                                        <v-progress-circular
                                                            indeterminate
                                                            color="grey lighten-5"
                                                        ></v-progress-circular>
                                                    </v-row>
                                                </template>
                                            </v-img>
                                        </v-card>
                                    </v-flex>
                                </v-layout>
                            </v-card-text>
                        </v-card>
                    </v-flex>

                    <v-flex xs12>
                        <h2
                            class="display-1 mb-3 mt-3"
                        >
                            Global Library
                        </h2>

                        <v-upload
                            url="/images/upload"
                            accept="image/jpeg, image/png"
                            role="image"
                            fileType="image"
                            :model="model"
                            :modelId="modelId"
                            @uploaded="uploadedImage"
                            @error="alertError"
                            multiple
                        >
                            Drag your image<br> or click to browse
                        </v-upload>
                    </v-flex>
                    <v-flex xs12>
                        <v-slide-y-transition mode="out-in">
                            <v-card>
                                <v-card-title dark class="primary white--text pa-3">

                                    <div class="text--white text-uppercase subtitle-1 font-weight-medium pa-2">
                                        {{ images.length }}
                                        <span v-if="images.length === 1">Result</span>
                                        <span v-else>Results</span>
                                    </div>

                                    <v-spacer></v-spacer>

                                    <v-text-field
                                        v-model="searchQuery"
                                        placeholder="Search"
                                        hide-details
                                        :autocomplete="'new-password'"
                                        solo
                                        :disabled="fetchingImages"
                                    ></v-text-field>
                                </v-card-title>
                                <v-card-text class="pa-3">
                                    <v-layout wrap>
                                        <v-flex
                                            v-for="(image, index) in images"
                                            :key="index"
                                            xs12 sm4 md3
                                            class="d-flex child-flex"
                                        >
                                            <v-card flat tile>
                                                <v-img
                                                    @click="selectImage(image)"
                                                    :src="'/images/' + image.hash + '-ft=320+320.' + image.type"
                                                    :lazy-src="'/images/' + image.hash + '-ft=320+320.' + image.type"
                                                    aspect-ratio="1"
                                                    class="grey lighten-2"
                                                >
                                                    <template v-slot:placeholder>
                                                        <v-row
                                                            class="fill-height ma-0"
                                                            align="center"
                                                            justify="center"
                                                        >
                                                            <v-progress-circular
                                                                indeterminate
                                                                color="grey lighten-5"
                                                            ></v-progress-circular>
                                                        </v-row>
                                                    </template>
                                                </v-img>
                                            </v-card>
                                        </v-flex>
                                        <v-flex xs12 class="text-center mt-2" v-if="noImagesFound && !fetchingImages">
                                            <p class="red--text">Could not find any images...</p>
                                        </v-flex>
                                        <v-flex
                                            xs12
                                            class="text-center mt-2"
                                            v-if="thereIsMoreImages"
                                        >
                                            <v-btn
                                                @click="loadMoreImages"
                                                :disabled="fetchingImages"
                                                color="primary"
                                            >
                                                Load More
                                            </v-btn>
                                        </v-flex>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-slide-y-transition>
                    </v-flex>
                </v-layout>
            </v-container>
        </v-card>
    </v-dialog>
</template>
<script>
    export default {
        data() {
            return {
                dialog: true,
                fetchingImages: true,
                page: 0,
                objectImages: [],
                images: [],
                searchQuery: '',
                timeout: null,
                noImagesFound: false,
                thereIsMoreImages: false,
            }
        },
        props: {
            'model': {
                default: null,
            },
            'modelId': {
                default: null,
            },
        },
        watch: {
            'searchQuery'() {
                this.fetchImagesDelayed();
            },
        },
        name: 'Editor-Image-Select-Dialog',
        mounted() {
            if (this.model && this.modelId) {
                this.fetchObjectImages();
            }

            window.axios.post('/images/searchPaginated?page=' + this.page).then(response => {
                this.page++;
                this.fetchingImages = false;
                this.images = response.data.images.data;
                this.thereIsMoreImages = true;
            });
        },
        methods: {
            fetchObjectImages() {
                window.axios.post('/images/associations', {
                    model: this.model,
                    modelId: this.modelId
                }).then(response => {
                    this.objectImages = response.data.images;
                })
            },
            closeImageSelect() {
                this.$emit('close');
            },
            selectImage(image) {
                this.$emit('select', image);
            },
            fetchImagesDelayed() {
                clearTimeout(this.timeout);
                this.timeout = setTimeout(() => {
                    this.images = [];
                    this.page = 1;
                    this.noImagesFound = false;
                    this.loadMoreImages();
                }, 500);
            },
            loadMoreImages() {
                this.fetchingImages = true;
                window.axios.post('/images/searchPaginated?page=' + this.page, {searchQuery: this.searchQuery}).then(response => {
                    if (response.data.images.total > 0) {
                        this.page++;
                        this.fetchingImages = false;
                        this.images = this.images.concat(response.data.images.data);
                        this.thereIsMoreImages = response.data.images.total > 18;
                    } else {
                        this.fetchingImages = false;
                        this.thereIsMoreImages = false;
                        this.noImagesFound = true;
                    }
                });
            },

            uploadedImage(response) {
                this.selectImage(response.image);
                this.$toasted.show('Image uploaded!', {
                    theme: "default",
                    position: "top-center",
                    duration: 2000
                });
            },
            alertError(message) {
                this.$toasted.show(message, {
                    theme: "error",
                    position: "top-center",
                    duration: 3500
                });
            }
        },
    }
</script>
