import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import fileIcon from '@ckeditor/ckeditor5-media-embed/theme/icons/media-placeholder.svg';

export default class InsertFile {
    constructor(editor) {
        this.editor = editor;
    }

    init() {
        const editor = this.editor;

        editor.ui.componentFactory.add('insertFile', locale => {
            const view = new ButtonView(locale);

            view.set({
                label: 'Insert file',
                icon: fileIcon,
                tooltip: true
            });

            // Callback executed once the image is clicked.
            view.on('execute', () => {
                let event = new CustomEvent('selectFile', {'detail': editor});
                document.dispatchEvent(event);
            });

            return view;
        });
    }

}
