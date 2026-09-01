let data;
let lines;

const getPictureName = (name) => "images/tattoos/" + name.split(" ").join("").split(",").join("") + "-no-bg.png";

const renderVisualization = () => {
    const containerWidth = document.getElementById("visualization").clientWidth;
    const containerHeight = document.getElementById("visualization").clientHeight;

    const margin = {
        top: 0 * containerHeight,
        right: 0 * containerWidth,
        bottom: 0 * containerHeight,
        left: 0 * containerWidth
    };

    const width = containerWidth - (margin.right + margin.left);
    const height = containerHeight - (margin.top + margin.bottom);

    const svg = d3.select(`#visualization`);
    const chartArea = svg.append('g')
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    
    chartArea.append('defs')
        .append('clipPath')
        .attr('id', 'chart-mask')
        .append('circle')
        .attr('r', 1 * width / 3)
        .attr('cx', width / 2)
        .attr('cy', height / 2);

    const chart = chartArea.append("g")
        .attr("clip-path", "url(#chart-mask)");

    const mapX = d => d.lon;
    const mapY = d => d.lat;

    const biomeXScale = d3.scaleLinear().domain(d3.extent(data, d => d.x)).range([width / 3, 2 * width / 3]);
    const biomeYScale = d3.scaleLinear().domain(d3.extent(data, d => d.y)).range([2 * height / 3, height / 3]);

    const colourMap = {
        2021: "#E5E100",
        2022: "#E5B500",
        2023: "#E58A00",
        2024: "#E55E00",
        2026: "#E50700",
    };

    // biome
    chart.selectAll("image.background")
        .data([null])
        .join("image")
        .attr("class", "background")
        .attr("width", 2 * width / 3)
        .attr("height", 2 * height / 3)
        .attr("transform", `translate(${width / 6}, ${height / 6})`)
        .attr("opacity", 0.7)
        .attr("href", "images/background.jpg");

    chart.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => biomeXScale(d.x))
        .attr("cy", d => biomeYScale(d.y))
        .attr("r", width / 100)
        .attr("stroke-width", width / 200)
        .attr("stroke", d => colourMap[d.date.getFullYear()])
        .attr("fill", "none");

    // pictures
    const arcGenerator = d3.arc()
        .outerRadius(0.4 * width)
        .innerRadius(0.4 * width)
        .startAngle(Math.PI / 16)
        .endAngle(31 / 16 * Math.PI);
        
    chartArea.selectAll('path.route')
        .data([null])
        .join('path')
        .attr('class', 'route')
        .attr('d', d => arcGenerator())
        .attr('fill', "none")
        .attr('stroke', "black")
        .attr("stroke-width", width / 300)
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .attr("stroke-dasharray", `${width / 150}, ${width / 75}`);

    const pictureScale = d3.scaleLinear().domain([0, data.length - 1]).range([Math.PI / 16, 31 / 16 * Math.PI]);

    const pictureSize = 0.08 * width;
    chartArea.selectAll("image.tattoo")
        .data(data)
        .join("image")
        .attr("class", "tattoo")
        .attr("width", pictureSize)
        .attr("height", pictureSize)
        .attr("x", (_, i) => 0.4 * width * Math.cos(pictureScale(i) - Math.PI / 2) - pictureSize / 2)
        .attr("y", (_, i) => 0.4 * height * Math.sin(pictureScale(i) - Math.PI / 2) - pictureSize / 2)
        .attr("transform", `translate(${width / 2}, ${height / 2})`)
        .attr("href", d => d.name);

    const textRadius = 0.46 * width;
    chartArea.selectAll("path.text")
        .data([null])
        .join("path")
        .attr("id", "circle-path")
        .attr("class", "text")
        .attr("stroke-width", 0)
        .attr("fill", "none")
        .attr("d", `M ${width / 2}, ${height / 2}
                    m 0,-${textRadius}
                    a ${textRadius},${textRadius} 0 0,1 0,${textRadius * 2}
                    a ${textRadius},${textRadius} 0 0,1 0,-${textRadius * 2}`);

    chartArea.selectAll("text")
        .data([
            {
                name: "2021",
                index: 0,
            },
            {
                name: "2022",
                index: 19,
            },
            {
                name: "2023",
                index: 25,
            },
            {
                name: "2024",
                index: 26,
            },
            {
                name: "2026",
                index: 27,
            },
        ])
        .join("text")
        .attr("text-anchor", "middle")
        .attr("fill", d => colourMap[+d.name])
        .attr("font-weight", 800)
        .attr("text-multiplier", 1)
        .selectAll("textPath")
        .data(d => [d])
        .join("textPath")
        .attr("href", "#circle-path")
        .attr("startOffset", d => (100 * (d.index + 1) / (data.length + 1)) + "%")
        .text(d => d.name);
};

const resizeAndRender = () => {
    d3.selectAll("#visualization > *").remove();

    renderVisualization();

    d3.selectAll("text")
        .attr("font-size", function() { return d3.select(this).attr("text-multiplier") * 0.03 * document.getElementById("visualization").clientHeight });
};

window.onresize = resizeAndRender;

Promise.all([d3.json('data/data.json')]).then(([_data]) => {
    data = _data;
    data.forEach(d => {
        d.date = new Date(d.date);
        d.name = getPictureName(d.name);
    });

    data.sort((a, b) => a.date > b.date);
    
    console.log(data);

    resizeAndRender();
});