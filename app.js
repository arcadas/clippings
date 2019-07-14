
document.getElementById("clippings_file").addEventListener("change", () => {
    const clippings = new Clippings(document.getElementById("clippings_file").files);
    clippings.convert();
});

class Clippings {
    constructor(input) {
        this.input = input;
        this.textSource = [];
        this.textConverted = [];
        this.textTitles = [];
        this.textFilters = ['Your Highlight', 'Your Bookmark'];
        this.validate();
    }
    validate() {
        if (this.input.length > 1)
        {
            alert('Please upload only one file!');
        }
        if (this.input[0].size > 2097152)
        {
            alert('Maximum file size is 2MB!');
        }
        if (this.input[0].type != 'text/plain')
        {
            alert('Only text file allowed!');
        }
    }
    read(callback) {
        var reader = new FileReader();
        reader.onload = () => {
            this.textSource = reader.result
                .split("\n")
                .filter(line => this.filter(line, this.textFilters))
                .map(line => line.trim());
            callback(reader.result);
        };
        reader.onerror = event => {
            alert(event.target.error.name);
        };
        reader.readAsText(this.input[0]);
    }
    filter(line, textFilters) {
        let filter = true;
        textFilters.forEach(textFilter => {
            filter = filter && !line.includes(textFilter);
        });
        return line.match(/[a-zA-Z0-9 ]/i) && filter;
    }
    titles() {
        const titles = Object.entries(
            this.textSource
                .filter(line => {
                    return line.match(/[a-z]/i) && line.match(/[()]/i);
                })
                .map(line => {
                    return { count: 1, line: line};
                })
                .reduce((a, b) => {
                    a[b.line] = (a[b.line] || 0) + b.count;
                    return a;
                }, {})
        )
            .filter(item => item[1] > 1);

        this.textTitles = titles
            .map(item => item[0])
            .sort();
        this.textConverted = titles
            .map(item => [item[0], item[1], ''])
            .sort();
    }
    highlights() {
        let indexOfTitleLast = '';
        for (let line of this.textSource) {
            let indexOfTitle = this.textTitles.indexOf(line);
            if (indexOfTitle != -1) {
                indexOfTitleLast = indexOfTitle;
            }
            else
            {
                this.textConverted[indexOfTitleLast][2] += line + '<br /><br />';
            }
        }
    }
    convert() {
        this.read(() => {
            this.titles();
            this.highlights();
            this.show();
        });
    }
    show() {
        this.textConverted.forEach((item, index) => {
            const cardClone = document.querySelector(".card:first-child").cloneNode(true);
            document.getElementById("accordion").appendChild(cardClone);
            document.querySelector(".card:last-child #collapseOne").id = 'collapse-' + index;
            document.querySelector(".card:last-child button").setAttribute('data-target', '#collapse-' + index);
            document.querySelector(".card:last-child button").setAttribute('aria-controls', 'collapse-' + index);
            document.querySelector(".card:last-child").style.display = "block";
            document.querySelector(".card:last-child button").innerHTML = item[0].substring(0, 120);
            document.querySelector(".card:last-child .card-body").innerHTML = item[2];
        });
    }
}
